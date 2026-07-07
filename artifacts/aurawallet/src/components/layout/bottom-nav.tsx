import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Wallet, Receipt, Users, BarChart3, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tags } from 'lucide-react';

const MAIN_NAV = [
  { href: '/', label: 'Dash', icon: LayoutDashboard },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/spending', label: 'Spend', icon: Receipt },
  { href: '/owed', label: 'Owed', icon: Users },
];

const OVERFLOW_NAV = [
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

export function BottomNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-2xl border-b-0 px-2 pb-safe pt-2">
      <div className="flex items-center justify-around h-14">
        {MAIN_NAV.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full gap-1 cursor-pointer transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={20} className={cn(isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <div className="flex flex-col items-center justify-center w-16 h-full gap-1 cursor-pointer text-muted-foreground hover:text-foreground">
              <MoreHorizontal size={20} />
              <span className="text-[10px] font-medium">More</span>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl border-t-white/10 glass-card">
            <div className="grid grid-cols-3 gap-4 pt-4 pb-8">
              {OVERFLOW_NAV.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 gap-3 hover:bg-white/10 transition-colors">
                    <item.icon size={24} className="text-primary" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
