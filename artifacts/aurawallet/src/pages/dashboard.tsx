import { useStorageData } from '@/lib/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, Wallet, Activity, CreditCard } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area } from 'recharts';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { MouseEvent, useMemo } from 'react';
import { formatJOD, formatJODCompact } from '@/lib/currency';

function BalanceHero({ balance }: { balance: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className="w-full h-64 md:h-80 perspective-[1000px] mb-8 relative flex items-center justify-center cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-md h-full rounded-3xl glass-card luxury-glow overflow-hidden"
      >
        {/* Glow effect that follows mouse */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            background: useTransform(
              [mouseXSpring, mouseYSpring],
              ([mx, my]) => `radial-gradient(circle at ${(mx as number + 0.5) * 100}% ${(my as number + 0.5) * 100}%, hsl(var(--primary)) 0%, transparent 60%)`
            )
          }}
        />

        <div 
          className="absolute inset-0 p-8 flex flex-col justify-between z-10"
          style={{ transform: "translateZ(50px)" }}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <span className="text-white/60 font-medium tracking-wide text-sm uppercase">Personal Cash Wallet</span>
            </div>
            <Activity className="w-5 h-5 text-white/40" />
          </div>

          <div className="space-y-1">
            <p className="text-white/50 text-sm font-medium">Total Balance</p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white">
              {formatJOD(balance)}
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="h-2 w-12 rounded-full bg-primary/80" />
            <div className="h-2 w-4 rounded-full bg-white/20" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const { walletBalance, spending, walletTransactions, categories } = useStorageData();

  const totalSpending = useMemo(() => {
    return spending.reduce((acc, s) => acc + s.amount, 0);
  }, [spending]);

  const recentActivity = useMemo(() => {
    const combined = [
      ...walletTransactions.map(t => ({ ...t, kind: 'wallet' as const })),
      ...spending.map(s => ({ ...s, kind: 'spending' as const }))
    ];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [walletTransactions, spending]);

  const chartData = useMemo(() => {
    // Generate last 6 months data
    const data: Record<string, { month: string; income: number; expenses: number }> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = format(d, 'MMM');
      data[monthStr] = { month: monthStr, income: 0, expenses: 0 };
    }

    walletTransactions.forEach(t => {
      const m = format(new Date(t.date), 'MMM');
      if (data[m]) {
        if (t.type === 'credit') data[m].income += t.amount;
        if (t.type === 'debit') data[m].expenses += t.amount;
      }
    });

    spending.forEach(s => {
      const m = format(new Date(s.date), 'MMM');
      if (data[m]) {
        data[m].expenses += s.amount;
      }
    });

    return Object.values(data);
  }, [walletTransactions, spending]);

  const spendByCategory = useMemo(() => {
    const sums: Record<string, number> = {};
    spending.forEach(s => {
      sums[s.categoryId] = (sums[s.categoryId] || 0) + s.amount;
    });
    return Object.entries(sums)
      .map(([id, amount]) => ({
        category: categories.find(c => c.id === id) || { name: 'Unknown', color: 'bg-gray-500', icon: 'QuestionMark' },
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [spending, categories]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Overview</h1>
        <p className="text-muted-foreground">Your financial universe at a glance.</p>
      </header>

      <BalanceHero balance={walletBalance} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatJOD(totalSpending)}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Remaining</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatJOD(walletBalance)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-none overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg">Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatJODCompact} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-lg">Top Spending Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {spendByCategory.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.category.color}`} />
                    <span className="font-medium">{item.category.name}</span>
                  </div>
                  <span className="font-bold text-muted-foreground">{formatJOD(item.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg px-1">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item) => {
              const isCredit = item.kind === 'wallet' && (item as any).type === 'credit';
              const amount = item.amount;
              const date = format(new Date(item.date), 'MMM d, yyyy');
              
              return (
                <div key={item.id} className="p-4 rounded-2xl bg-card/40 border border-white/5 backdrop-blur-sm flex items-center justify-between group hover:bg-card/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isCredit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-muted-foreground'}`}>
                      {item.kind === 'spending' ? <CreditCard size={20} /> : <Wallet size={20} />}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{item.note || 'Untitled Transaction'}</p>
                      <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${isCredit ? 'text-emerald-500' : 'text-foreground'}`}>
                    {isCredit ? '+' : '-'}{formatJOD(amount)}
                  </div>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">No recent activity.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
