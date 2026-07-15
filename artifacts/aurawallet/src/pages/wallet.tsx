import { useState } from 'react';
import { useStorageData } from '@/lib/use-storage';
import { storage, WalletTransaction } from '@/lib/storage';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownRight, ArrowUpRight, Plus, Minus, Search, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatJOD } from '@/lib/currency';

const txSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  note: z.string().min(1, "Note is required"),
  date: z.string().min(1, "Date is required"),
});

export default function WalletPage() {
  const { walletBalance, walletTransactions } = useStorageData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [search, setSearch] = useState('');

  const addForm = useForm<z.infer<typeof txSchema>>({
    resolver: zodResolver(txSchema),
    defaultValues: { amount: 0, note: '', date: new Date().toISOString().split('T')[0] }
  });

  const subForm = useForm<z.infer<typeof txSchema>>({
    resolver: zodResolver(txSchema),
    defaultValues: { amount: 0, note: '', date: new Date().toISOString().split('T')[0] }
  });

  const handleAdd = (values: z.infer<typeof txSchema>) => {
    const newTx: WalletTransaction = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'credit',
      amount: values.amount,
      note: values.note,
      date: new Date(values.date).toISOString(),
      createdAt: new Date().toISOString(),
    };
    storage.setWalletTransactions([newTx, ...walletTransactions]);
    setIsAddOpen(false);
    addForm.reset();
  };

  const handleSub = (values: z.infer<typeof txSchema>) => {
    const newTx: WalletTransaction = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'debit',
      amount: values.amount,
      note: values.note,
      date: new Date(values.date).toISOString(),
      createdAt: new Date().toISOString(),
    };
    storage.setWalletTransactions([newTx, ...walletTransactions]);
    setIsSubOpen(false);
    subForm.reset();
  };

  const sortedTxs = [...walletTransactions]
    .filter(tx => tx.note.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Wallet</h1>
          <p className="text-muted-foreground">A personal cash tracker — not a bank account or payment card.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isSubOpen} onOpenChange={setIsSubOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-white/10 hover:bg-white/5" data-testid="btn-withdraw">
                <Minus className="w-4 h-4 mr-2" /> Remove Funds
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Remove Funds from Balance</DialogTitle>
              </DialogHeader>
              <form onSubmit={subForm.handleSubmit(handleSub)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" {...subForm.register('amount')} className="bg-black/20 border-white/10 text-xl" />
                  {subForm.formState.errors.amount && <p className="text-sm text-destructive">{subForm.formState.errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...subForm.register('date')} className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Input {...subForm.register('note')} className="bg-black/20 border-white/10" placeholder="e.g. Balance correction" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full" variant="destructive">Confirm Withdrawal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground luxury-glow" data-testid="btn-deposit">
                <Plus className="w-4 h-4 mr-2" /> Deposit
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Deposit Funds</DialogTitle>
              </DialogHeader>
              <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" {...addForm.register('amount')} className="bg-black/20 border-white/10 text-xl" />
                  {addForm.formState.errors.amount && <p className="text-sm text-destructive">{addForm.formState.errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...addForm.register('date')} className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Input {...addForm.register('note')} className="bg-black/20 border-white/10" placeholder="e.g. Salary" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Confirm Deposit</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Card className="glass-card border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Wallet className="w-48 h-48 text-primary transform rotate-12" />
        </div>
        <CardContent className="p-8 md:p-12">
          <div className="space-y-2 relative z-10">
            <p className="text-primary font-medium tracking-wide uppercase text-sm">Available Balance</p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
              {formatJOD(walletBalance)}
            </h2>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Transaction History</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search transactions..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card/40 border-white/10 rounded-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          {sortedTxs.map((tx) => {
            const isCredit = tx.type === 'credit';
            return (
              <div key={tx.id} className="p-4 rounded-2xl glass-card flex items-center justify-between group hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isCredit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                    {isCredit ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="font-medium">{tx.note}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMMM d, yyyy')}</p>
                  </div>
                </div>
                <div className={`font-semibold text-lg ${isCredit ? 'text-emerald-500' : 'text-foreground'}`}>
                  {isCredit ? '+' : '-'}{formatJOD(tx.amount)}
                </div>
              </div>
            );
          })}
          {sortedTxs.length === 0 && (
            <div className="text-center p-12 glass-card rounded-2xl text-muted-foreground">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
