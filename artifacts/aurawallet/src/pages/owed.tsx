import { useState } from 'react';
import { useStorageData } from '@/lib/use-storage';
import { storage, OwedRecord } from '@/lib/storage';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, CheckCircle2, Circle, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { formatJOD } from '@/lib/currency';

const owedSchema = z.object({
  personName: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  note: z.string().min(1, "Note is required"),
  date: z.string().min(1, "Date is required"),
});

export default function OwedPage() {
  const { owed } = useStorageData();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof owedSchema>>({
    resolver: zodResolver(owedSchema),
    defaultValues: { personName: '', amount: 0, note: '', date: new Date().toISOString().split('T')[0] }
  });

  const onSubmit = (values: z.infer<typeof owedSchema>) => {
    if (editingId) {
      const updated = owed.map(o => o.id === editingId ? { ...o, ...values, date: new Date(values.date).toISOString() } : o);
      storage.setOwed(updated);
    } else {
      const newOwed: OwedRecord = {
        id: Math.random().toString(36).substring(2, 9),
        personName: values.personName,
        amount: values.amount,
        note: values.note,
        date: new Date(values.date).toISOString(),
        isPaid: false,
        createdAt: new Date().toISOString(),
      };
      storage.setOwed([newOwed, ...owed]);
    }
    setIsOpen(false);
    form.reset();
    setEditingId(null);
  };

  const handleEdit = (record: OwedRecord) => {
    setEditingId(record.id);
    form.reset({
      personName: record.personName,
      amount: record.amount,
      note: record.note,
      date: new Date(record.date).toISOString().split('T')[0]
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this record?')) {
      storage.setOwed(owed.filter(o => o.id !== id));
    }
  };

  const togglePaid = (id: string) => {
    const updated = owed.map(o => o.id === id ? { ...o, isPaid: !o.isPaid } : o);
    storage.setOwed(updated);
  };

  const openNew = () => {
    setEditingId(null);
    form.reset({ personName: '', amount: 0, note: '', date: new Date().toISOString().split('T')[0] });
    setIsOpen(true);
  };

  const unpaidOwed = owed.filter(o => !o.isPaid).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const paidOwed = owed.filter(o => o.isPaid).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalUnpaid = unpaidOwed.reduce((acc, o) => acc + o.amount, 0);

  const RecordList = ({ records }: { records: OwedRecord[] }) => (
    <div className="space-y-3 mt-4">
      {records.map((item) => (
        <div key={item.id} className="p-5 rounded-2xl glass-card flex items-center justify-between group hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => togglePaid(item.id)} 
              className={`p-1 rounded-full transition-colors ${item.isPaid ? 'text-emerald-500' : 'text-muted-foreground hover:text-primary'}`}
            >
              {item.isPaid ? <CheckCircle2 size={28} /> : <Circle size={28} />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{item.personName}</span>
                <span className="text-muted-foreground text-sm">• {item.note}</span>
              </div>
              <p className="text-xs text-muted-foreground">{format(new Date(item.date), 'MMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`text-xl font-bold ${item.isPaid ? 'text-muted-foreground line-through' : 'text-accent luxury-glow-accent'}`}>
              {formatJOD(item.amount)}
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
      ))}
      {records.length === 0 && (
        <div className="text-center p-12 glass-card rounded-2xl border border-white/5 text-muted-foreground">
          No records found.
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Money Owed</h1>
          <p className="text-muted-foreground">Keep track of who owes you what.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setEditingId(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground luxury-glow" onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Record' : 'Add Record'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Person's Name</Label>
                <Input {...form.register('personName')} className="bg-black/20 border-white/10" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" {...form.register('amount')} className="bg-black/20 border-white/10 text-xl" />
              </div>
              <div className="space-y-2">
                <Label>Reason / Note</Label>
                <Input {...form.register('note')} className="bg-black/20 border-white/10" placeholder="e.g. Dinner split" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register('date')} className="bg-black/20 border-white/10" />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">{editingId ? 'Save Changes' : 'Add Record'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="glass-card border-none bg-accent/10 border border-accent/20">
        <CardContent className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Users size={32} />
            </div>
            <div>
              <p className="text-accent font-medium uppercase tracking-widest text-sm mb-1">Total Outstanding</p>
              <h2 className="text-4xl md:text-5xl font-bold text-accent drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                {formatJOD(totalUnpaid)}
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="unpaid" className="w-full">
        <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl w-full max-w-sm mb-6">
          <TabsTrigger value="unpaid" className="flex-1 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground">
            Unpaid ({unpaidOwed.length})
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex-1 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground">
            Settled ({paidOwed.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="unpaid" className="mt-0">
          <RecordList records={unpaidOwed} />
        </TabsContent>
        <TabsContent value="paid" className="mt-0">
          <RecordList records={paidOwed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
