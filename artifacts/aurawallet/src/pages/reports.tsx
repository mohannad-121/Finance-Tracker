import { useStorageData } from '@/lib/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';

export default function ReportsPage() {
  const { spending, categories, walletTransactions, walletBalance, owed } = useStorageData();

  const spendByCategory = useMemo(() => {
    const sums: Record<string, number> = {};
    spending.forEach(s => {
      sums[s.categoryId] = (sums[s.categoryId] || 0) + s.amount;
    });
    return Object.entries(sums)
      .map(([id, amount]) => {
        const cat = categories.find(c => c.id === id);
        return {
          name: cat?.name || 'Unknown',
          value: amount,
          color: cat?.color ? `var(--${cat.color.replace('bg-', '')})` : '#888', // Fallback
          tailwindColor: cat?.color || 'bg-gray-500'
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [spending, categories]);

  const monthlySpending = useMemo(() => {
    const data: Record<string, { month: string; amount: number; fullDate: string }> = {};
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = format(d, 'yyyy-MM');
      data[key] = { month: format(d, 'MMM'), amount: 0, fullDate: key };
    }

    spending.forEach(s => {
      const d = new Date(s.date);
      const key = format(d, 'yyyy-MM');
      if (data[key]) {
        data[key].amount += s.amount;
      }
    });

    return Object.values(data);
  }, [spending]);

  const totalSpentAllTime = spending.reduce((acc, s) => acc + s.amount, 0);
  const totalIncomeAllTime = walletTransactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
  const totalUnpaidOwed = owed.filter(o => !o.isPaid).reduce((acc, o) => acc + o.amount, 0);

  // Colors for Pie Chart mapped to HSL values or specific hexes based on standard tailwind colors used
  const getColorHex = (tailwindClass: string) => {
    const map: Record<string, string> = {
      'bg-rose-500': '#f43f5e',
      'bg-blue-500': '#3b82f6',
      'bg-fuchsia-500': '#d946ef',
      'bg-teal-500': '#14b8a6',
      'bg-amber-500': '#f59e0b',
      'bg-emerald-500': '#10b981',
      'bg-slate-500': '#64748b',
      'bg-violet-500': '#8b5cf6',
    };
    return map[tailwindClass] || '#a855f7';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your financial data.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-none bg-primary/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Income</p>
            <h3 className="text-3xl font-bold text-emerald-400">${totalIncomeAllTime.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="glass-card border-none bg-destructive/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Spent</p>
            <h3 className="text-3xl font-bold text-destructive">${totalSpentAllTime.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="glass-card border-none bg-accent/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Net Worth (Balance + Owed)</p>
            <h3 className="text-3xl font-bold text-accent">${(walletBalance + totalUnpaidOwed).toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <BarChart3 className="w-32 h-32 text-primary" />
          </div>
          <CardHeader>
            <CardTitle>Spending Over Time (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySpending} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {monthlySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${entry.amount > 0 ? 0.8 : 0.2})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <PieIcon className="w-32 h-32 text-primary" />
          </div>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              {spendByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {spendByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColorHex(entry.tailwindColor)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center">
                  <Activity className="w-12 h-12 opacity-20 mb-2" />
                  <p>No data to display</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {spendByCategory.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColorHex(item.tailwindColor) }} />
                  <span className="text-sm truncate flex-1">{item.name}</span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {Math.round((item.value / totalSpentAllTime) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
