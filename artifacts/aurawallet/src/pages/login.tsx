import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletCards } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (isSignUp && !result.data.session) setMessage('Check your email to confirm your account, then sign in.');
  }

  return (
    <div className="min-h-[100dvh] grid place-items-center bg-background px-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/15 blur-[120px]" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-accent/10 blur-[120px]" />
      <Card className="w-full max-w-md border-white/10 bg-card/80 backdrop-blur-xl relative">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto size-12 rounded-2xl bg-primary/15 text-primary grid place-items-center"><WalletCards /></div>
          <CardTitle className="text-2xl text-gradient">AuraWallet</CardTitle>
          <CardDescription>{isSignUp ? 'Create your private finance workspace' : 'Welcome back — sign in to your wallet'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {isSignUp && <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" /></div>}
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required autoComplete={isSignUp ? 'new-password' : 'current-password'} /></div>
            {message && <p className="text-sm text-center text-muted-foreground" role="status">{message}</p>}
            <Button className="w-full" type="submit" disabled={busy}>{busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}</Button>
          </form>
          <button className="w-full mt-5 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}>
            {isSignUp ? 'Already have an account? Sign in' : "New here? Create an account"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
