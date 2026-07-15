import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from '@/components/layout/shell';
import DashboardPage from '@/pages/dashboard';
import WalletPage from '@/pages/wallet';
import SpendingPage from '@/pages/spending';
import CategoriesPage from '@/pages/categories';
import OwedPage from '@/pages/owed';
import ReportsPage from '@/pages/reports';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import LoginPage from '@/pages/login';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/spending" component={SpendingPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/owed" component={OwedPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { session, loading } = useAuth();

  if (loading) return <div className="min-h-[100dvh] grid place-items-center bg-background text-muted-foreground">Loading AuraWallet…</div>;
  if (!session) return <LoginPage />;

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Shell><Router /></Shell>
    </WouterRouter>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider><AuthenticatedApp /></AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
