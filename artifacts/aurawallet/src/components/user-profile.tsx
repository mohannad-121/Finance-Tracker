import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera, Loader2, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function UserProfile({ collapsed }: { collapsed: boolean }) {
  const { session } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const name = session?.user.user_metadata.full_name || session?.user.email?.split('@')[0] || 'User';

  async function loadAvatar() {
    if (!session) return;
    const { data: profile } = await supabase.from('profiles').select('avatar_path').eq('user_id', session.user.id).maybeSingle();
    if (!profile?.avatar_path) return;
    const { data } = await supabase.storage.from('avatars').createSignedUrl(profile.avatar_path, 3600);
    setAvatarUrl(data?.signedUrl);
  }

  useEffect(() => { void loadAvatar(); }, [session?.user.id]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !session) return;
    setError('');
    if (!file.type.startsWith('image/')) return setError('Please select an image file.');
    if (file.size > 5 * 1024 * 1024) return setError('Image must be under 5 MB.');
    setUploading(true);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${session.user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
    if (!uploadError) {
      const { error: profileError } = await supabase.from('profiles').upsert({ user_id: session.user.id, display_name: name, avatar_path: path, updated_at: new Date().toISOString() });
      if (profileError) setError(profileError.message); else await loadAvatar();
    } else setError(uploadError.message);
    setUploading(false);
    event.target.value = '';
  }

  return <div className={cn('mx-3 mb-3 rounded-2xl border border-white/10 bg-white/[0.03] text-center', collapsed ? 'p-2' : 'p-4')}>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={upload} />
    <button onClick={() => inputRef.current?.click()} disabled={uploading} className={cn('relative mx-auto rounded-full overflow-hidden bg-primary/15 text-primary border-2 border-primary/30 hover:border-primary transition-colors group', collapsed ? 'size-10' : 'size-24')} title="Upload profile picture">
      {avatarUrl ? <img src={avatarUrl} alt={`${name}'s profile`} className="size-full object-cover" /> : <UserRound className="size-1/2 mx-auto" />}
      <span className="absolute inset-0 bg-black/60 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">{uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}</span>
    </button>
    {!collapsed && <><p className="font-semibold mt-3 truncate">{name}</p><p className="text-xs text-muted-foreground truncate">{session?.user.email}</p><button onClick={() => inputRef.current?.click()} className="text-xs text-primary hover:underline mt-2">{avatarUrl ? 'Change photo' : 'Upload photo'}</button>{error && <p className="text-[11px] text-destructive mt-2">{error}</p>}</>}
  </div>;
}
