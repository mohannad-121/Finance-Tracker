import { storage, Category, WalletTransaction, SpendingTransaction, OwedRecord } from './storage';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const defaultCategories: Category[] = [
  { id: 'cat_food', name: 'Food & Dining', color: 'bg-rose-500', icon: 'Utensils', isDefault: true },
  { id: 'cat_transport', name: 'Transportation', color: 'bg-blue-500', icon: 'Car', isDefault: true },
  { id: 'cat_shopping', name: 'Shopping', color: 'bg-fuchsia-500', icon: 'ShoppingBag', isDefault: true },
  { id: 'cat_bills', name: 'Bills & Utilities', color: 'bg-teal-500', icon: 'Zap', isDefault: true },
  { id: 'cat_ent', name: 'Entertainment', color: 'bg-amber-500', icon: 'Film', isDefault: true },
  { id: 'cat_health', name: 'Health', color: 'bg-emerald-500', icon: 'HeartPulse', isDefault: true },
  { id: 'cat_other', name: 'Other', color: 'bg-slate-500', icon: 'MoreHorizontal', isDefault: true },
];

export function seedData() {
  if (storage.isSeeded()) return;

  const now = new Date();
  
  // Create 6 wallet transactions
  const walletTxs: WalletTransaction[] = [
    { id: generateId(), type: 'credit', amount: 6500, note: 'Initial Deposit', date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
    { id: generateId(), type: 'debit', amount: 450, note: 'Watch Service', date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
    { id: generateId(), type: 'debit', amount: 120, note: 'Dinner at Nobu', date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
    { id: generateId(), type: 'credit', amount: 1500, note: 'Consulting Retainer', date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
    { id: generateId(), type: 'debit', amount: 2000, note: 'Rent', date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
    { id: generateId(), type: 'debit', amount: 150, note: 'Members Club', date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
  ];

  storage.setWalletTransactions(walletTxs);

  // Setup Categories
  storage.setCategories(defaultCategories);

  // Create 8 spending transactions
  const spendings: SpendingTransaction[] = [
    { id: generateId(), amount: 120, categoryId: 'cat_food', date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), note: 'Dinner at Nobu', createdAt: new Date().toISOString() },
    { id: generateId(), amount: 45, categoryId: 'cat_transport', date: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000).toISOString(), note: 'Uber Exec', createdAt: new Date().toISOString() },
    { id: generateId(), amount: 890, categoryId: 'cat_shopping', date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), note: 'Tom Ford Jacket', createdAt: new Date().toISOString() },
    { id: generateId(), amount: 150, categoryId: 'cat_bills', date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), note: 'Members Club', createdAt: new Date().toISOString() },
    { id: generateId(), amount: 450, categoryId: 'cat_other', date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(), note: 'Watch Service', createdAt: new Date().toISOString() },
    { id: generateId(), amount: 2000, categoryId: 'cat_bills', date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), note: 'Rent', createdAt: new Date().toISOString() },
    { id: generateId(), amount: 210, categoryId: 'cat_ent', date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), note: 'Theatre Tickets', createdAt: new Date().toISOString() },
    { id: generateId(), amount: 85, categoryId: 'cat_health', date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'Equinox Spa', createdAt: new Date().toISOString() },
  ];

  storage.setSpending(spendings);

  // Create 3 owed records
  const owed: OwedRecord[] = [
    { id: generateId(), personName: 'Julian', amount: 500, date: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(), note: 'Weekend trip', isPaid: true, createdAt: new Date().toISOString() },
    { id: generateId(), personName: 'Sarah', amount: 1200, date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(), note: 'Flight tickets', isPaid: false, createdAt: new Date().toISOString() },
    { id: generateId(), personName: 'Marcus', amount: 150, date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: 'Dinner split', isPaid: false, createdAt: new Date().toISOString() },
  ];

  storage.setOwed(owed);

  storage.setSeeded(true);
}
