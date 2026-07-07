import { useState } from 'react';
import { useStorageData } from '@/lib/use-storage';
import { storage, SpendingTransaction, Category } from '@/lib/storage';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Receipt } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const spendSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  note: z.string().min(1, "Note is required"),
  date: z.string().min(1, "Date is required"),
});

export default function SpendingPage() {
  const { spending, categories } = useStorageData();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof spendSchema>>({
    resolver: zodResolver(spendSchema),
    defaultValues: { amount: 0, categoryId: '', note: '', date: new Date().toISOString().split('T')[0] }
  });

  const onSubmit = (values: z.infer<typeof spendSchema>) => {
    if (editingId) {
      const updated = spending.map(s => s.id === editingId ? { ...s, ...values, date: new Date(values.date).toISOString() } : s);
      storage.setSpending(updated);
    } else {
      const newSpend: SpendingTransaction = {
        id: Math.random().toString(36).substring(2, 9),
        amount: values.amount,
        categoryId: values.categoryId,
        note: values.note,
        date: new Date(values.date).toISOString(),
        createdAt: new Date().toISOString(),
      };
      storage.setSpending([newSpend, ...spending]);
    }
    setIsOpen(false);
    form.reset();
    setEditingId(null);
  };

  const handleEdit = (spend: SpendingTransaction) => {
    setEditingId(spend.id);
    form.reset({
      amount: spend.amount,
      categoryId: spend.categoryId,
      note: spend.note,
      date: new Date(spend.date).toISOString().split('T')[0]
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this spending record?')) {
      storage.setSpending(spending.filter(s => s.id !== id));
    }
  };

  const openNew = () => {
    setEditingId(null);
    form.reset({ amount: 0, categoryId: '', note: '', date: new Date().toISOString().split('T')[0] });
    setIsOpen(true);
  };

  const sortedSpending = [...spending].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const currentMonthTotal = spending.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Spending</h1>
          <p className="text-muted-foreground">Track where your money goes.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">This Month</p>
            <p className="text-2xl font-bold text-gradient">${currentMonthTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setEditingId(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground luxury-glow" onClick={openNew} data-testid="btn-add-spending">
                <Plus className="w-4 h-4 mr-2" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" {...form.register('amount')} className="bg-black/20 border-white/10 text-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={(val) => form.setValue('categoryId', val)} value={form.watch('categoryId')}>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...form.register('date')} className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Note / Merchant</Label>
                  <Input {...form.register('note')} className="bg-black/20 border-white/10" placeholder="e.g. Whole Foods" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full">{editingId ? 'Save Changes' : 'Add Expense'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="space-y-3">
        {sortedSpending.map((item) => {
          const cat = categories.find(c => c.id === item.categoryId);
          return (
            <div key={item.id} className="p-5 rounded-2xl glass-card flex items-center justify-between group hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat?.color || 'bg-gray-500'}`}>
                  <Receipt className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-lg">{item.note}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs">
                      {cat?.name || 'Unknown'}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-xl font-bold">
                  ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 hover:bg-white/10">
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {sortedSpending.length === 0 && (
          <div className="text-center p-16 glass-card rounded-2xl">
            <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No spending recorded</h3>
            <p className="text-muted-foreground">Add your first expense to start tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
}
