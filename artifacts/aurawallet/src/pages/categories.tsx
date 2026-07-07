import { useState } from 'react';
import { useStorageData } from '@/lib/use-storage';
import { storage, Category } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Tags, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const catSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
});

const TAILWIND_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
  'bg-pink-500', 'bg-rose-500', 'bg-slate-500'
];

export default function CategoriesPage() {
  const { categories, spending } = useStorageData();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof catSchema>>({
    resolver: zodResolver(catSchema),
    defaultValues: { name: '', color: 'bg-violet-500' }
  });

  const onSubmit = (values: z.infer<typeof catSchema>) => {
    if (editingId) {
      const updated = categories.map(c => c.id === editingId ? { ...c, ...values } : c);
      storage.setCategories(updated);
    } else {
      const newCat: Category = {
        id: 'cat_' + Math.random().toString(36).substring(2, 9),
        name: values.name,
        color: values.color,
        icon: 'Tag',
        isDefault: false,
      };
      storage.setCategories([...categories, newCat]);
    }
    setIsOpen(false);
    form.reset();
    setEditingId(null);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    form.reset({ name: cat.name, color: cat.color });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    const isUsed = spending.some(s => s.categoryId === id);
    if (isUsed) {
      toast({
        title: "Cannot delete category",
        description: "This category is currently in use by spending records.",
        variant: "destructive"
      });
      return;
    }
    
    if (confirm('Delete this category?')) {
      storage.setCategories(categories.filter(c => c.id !== id));
    }
  };

  const openNew = () => {
    setEditingId(null);
    form.reset({ name: '', color: 'bg-violet-500' });
    setIsOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Categories</h1>
          <p className="text-muted-foreground">Organize your expenses your way.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setEditingId(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" /> New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Category' : 'Create Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...form.register('name')} className="bg-black/20 border-white/10" placeholder="e.g. Travel" />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {TAILWIND_COLORS.map(color => (
                    <div 
                      key={color}
                      onClick={() => form.setValue('color', color)}
                      className={`w-10 h-10 rounded-full cursor-pointer transition-all border-2 ${color} ${form.watch('color') === color ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-transparent hover:scale-105'}`}
                    />
                  ))}
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">{editingId ? 'Save Changes' : 'Create Category'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const usageCount = spending.filter(s => s.categoryId === cat.id).length;
          
          return (
            <div key={cat.id} className="p-5 rounded-2xl glass-card border border-white/5 relative group">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} shadow-lg`}>
                  <Tags className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{usageCount} transactions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <Button variant="outline" size="sm" className="flex-1 bg-white/5 hover:bg-white/10 border-none" onClick={() => handleEdit(cat)}>
                  <Edit2 className="w-3 h-3 mr-2" /> Edit
                </Button>
                {!cat.isDefault && (
                  <Button variant="outline" size="sm" className="flex-1 text-destructive bg-destructive/10 hover:bg-destructive/20 border-none" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="w-3 h-3 mr-2" /> Delete
                  </Button>
                )}
                {cat.isDefault && (
                  <div className="flex-1 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Info className="w-3 h-3" /> Default
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
