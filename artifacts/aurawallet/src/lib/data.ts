import { storage, Category } from './storage';
const STARTER_DATA_VERSION = 'life-categories-v2';

export const defaultCategories: Category[] = [
  { id: 'cat_food', name: 'Food & Dining', color: 'bg-rose-500', icon: 'Utensils', isDefault: true },
  { id: 'cat_groceries', name: 'Groceries', color: 'bg-green-500', icon: 'ShoppingBasket', isDefault: true },
  { id: 'cat_transport', name: 'Transportation', color: 'bg-blue-500', icon: 'Car', isDefault: true },
  { id: 'cat_travel', name: 'Travel & Holidays', color: 'bg-sky-500', icon: 'Plane', isDefault: true },
  { id: 'cat_housing', name: 'Rent & Housing', color: 'bg-indigo-500', icon: 'House', isDefault: true },
  { id: 'cat_bills', name: 'Bills & Utilities', color: 'bg-teal-500', icon: 'Zap', isDefault: true },
  { id: 'cat_phone', name: 'Phone & Internet', color: 'bg-cyan-500', icon: 'Wifi', isDefault: true },
  { id: 'cat_shopping', name: 'Shopping', color: 'bg-fuchsia-500', icon: 'ShoppingBag', isDefault: true },
  { id: 'cat_health', name: 'Health & Medical', color: 'bg-emerald-500', icon: 'HeartPulse', isDefault: true },
  { id: 'cat_fitness', name: 'Fitness & Sports', color: 'bg-lime-500', icon: 'Dumbbell', isDefault: true },
  { id: 'cat_education', name: 'Education', color: 'bg-violet-500', icon: 'GraduationCap', isDefault: true },
  { id: 'cat_ent', name: 'Entertainment', color: 'bg-amber-500', icon: 'Film', isDefault: true },
  { id: 'cat_subscriptions', name: 'Subscriptions', color: 'bg-purple-500', icon: 'RefreshCw', isDefault: true },
  { id: 'cat_family', name: 'Family & Children', color: 'bg-pink-500', icon: 'Baby', isDefault: true },
  { id: 'cat_pets', name: 'Pets', color: 'bg-orange-500', icon: 'PawPrint', isDefault: true },
  { id: 'cat_gifts', name: 'Gifts & Donations', color: 'bg-red-500', icon: 'Gift', isDefault: true },
  { id: 'cat_personal', name: 'Personal Care', color: 'bg-pink-500', icon: 'Sparkles', isDefault: true },
  { id: 'cat_business', name: 'Work & Business', color: 'bg-slate-500', icon: 'BriefcaseBusiness', isDefault: true },
  { id: 'cat_insurance', name: 'Insurance', color: 'bg-yellow-500', icon: 'ShieldCheck', isDefault: true },
  { id: 'cat_tax', name: 'Taxes & Fees', color: 'bg-red-500', icon: 'Landmark', isDefault: true },
  { id: 'cat_savings', name: 'Savings & Investments', color: 'bg-emerald-500', icon: 'PiggyBank', isDefault: true },
  { id: 'cat_other', name: 'Other', color: 'bg-slate-500', icon: 'MoreHorizontal', isDefault: true },
];

export function seedData() {
  if (storage.getSeedVersion() === STARTER_DATA_VERSION) return;

  const existing = storage.getCategories();
  const existingIds = new Set(existing.map(category => category.id));
  storage.setCategories([...existing, ...defaultCategories.filter(category => !existingIds.has(category.id))]);

  storage.setSeeded(true);
  storage.setSeedVersion(STARTER_DATA_VERSION);
}
