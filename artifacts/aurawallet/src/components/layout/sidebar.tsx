import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Wallet, Receipt, Tags, Users, BarChart3, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/spending', label: 'Spending', icon: Receipt },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/owed', label: 'Money Owed', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(storage.getSidebarCollapsed());

  useEffect(() => {
    storage.setSidebarCollapsed(collapsed);
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col transition-all duration-300 ease-in-out border-r border-white/5 bg-sidebar relative z-20",
        collapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 mb-4">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all", collapsed ? "opacity-0 w-0" : "opacity-100 w-auto")}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center luxury-glow">
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-gradient">AuraWallet</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("p-2 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors", collapsed && "mx-auto")}
          data-testid="button-toggle-sidebar"
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                data-testid={`link-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon size={22} className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-xl bg-card/50 border border-white/5 backdrop-blur-md">
            <p className="text-xs text-muted-foreground text-center">AuraWallet v1.0<br/>Luxury Edition</p>
          </div>
        </div>
      )}
    </aside>
  );
}
