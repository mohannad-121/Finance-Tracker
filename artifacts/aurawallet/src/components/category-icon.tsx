import {
  Baby, BriefcaseBusiness, Car, Dumbbell, Film, Gift, GraduationCap,
  HeartPulse, House, Landmark, MoreHorizontal, PawPrint, PiggyBank,
  Plane, RefreshCw, ShieldCheck, ShoppingBag, ShoppingBasket, Sparkles,
  Tag, Utensils, Wifi, Zap, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const icons: Record<string, LucideIcon> = {
  Baby, BriefcaseBusiness, Car, Dumbbell, Film, Gift, GraduationCap,
  HeartPulse, House, Landmark, MoreHorizontal, PawPrint, PiggyBank,
  Plane, RefreshCw, ShieldCheck, ShoppingBag, ShoppingBasket, Sparkles,
  Tag, Utensils, Wifi, Zap,
};

export function CategoryIcon({ icon, color, size = 'md' }: { icon?: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = icons[icon || ''] || Tag;
  return (
    <div className={cn(
      'relative shrink-0 grid place-items-center overflow-hidden text-white border border-white/20',
      'shadow-[0_10px_24px_-8px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.45)]',
      'transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-[-3deg] group-hover:scale-105',
      color || 'bg-slate-500',
      size === 'sm' && 'size-9 rounded-xl',
      size === 'md' && 'size-14 rounded-2xl',
      size === 'lg' && 'size-16 rounded-[1.25rem]',
    )}>
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
      <div className="absolute -right-3 -bottom-3 size-9 rounded-full bg-black/15 blur-sm" />
      <Icon className={cn('relative z-10 drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)]', size === 'sm' ? 'size-4' : size === 'lg' ? 'size-8' : 'size-6')} strokeWidth={2.2} />
      <span className="absolute bottom-1 left-1/2 h-px w-1/2 -translate-x-1/2 bg-white/40 blur-[1px]" />
    </div>
  );
}
