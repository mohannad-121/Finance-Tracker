import { supabase } from './supabase';

export type TransactionType = 'credit' | 'debit';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
  createdAt: string;
}

export interface SpendingTransaction {
  id: string;
  amount: number;
  categoryId: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface OwedRecord {
  id: string;
  personName: string;
  amount: number;
  date: string;
  note: string;
  isPaid: boolean;
  createdAt: string;
}

const PREFIX = 'aurawallet_';
let activeUserId: string | null = null;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const userKey = (key: string) => PREFIX + (activeUserId ? `${activeUserId}_` : '') + key;

const get = <T>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(userKey(key));
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const set = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(userKey(key), JSON.stringify(value));
    window.dispatchEvent(new Event('storage-update')); // trigger custom event for reactivity
    if (activeUserId && key !== 'sidebar_collapsed') scheduleCloudSave();
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};

const snapshot = () => ({
  walletTransactions: get<WalletTransaction[]>('wallet_transactions', []),
  spending: get<SpendingTransaction[]>('spending', []),
  categories: get<Category[]>('categories', []),
  owed: get<OwedRecord[]>('owed', []),
});

function scheduleCloudSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (!activeUserId) return;
    const userId = activeUserId;
    const current = snapshot();
    const tables = [
      { name: 'categories', rows: current.categories.map(c => ({ id: c.id, user_id: userId, name: c.name, color: c.color, icon: c.icon, is_default: c.isDefault })) },
      { name: 'wallet_transactions', rows: current.walletTransactions.map(t => ({ id: t.id, user_id: userId, type: t.type, amount: t.amount, note: t.note, transaction_date: t.date, created_at: t.createdAt })) },
      { name: 'spending', rows: current.spending.map(s => ({ id: s.id, user_id: userId, amount: s.amount, category_id: s.categoryId, description: s.note, spent_at: s.date, created_at: s.createdAt })) },
      { name: 'money_owed', rows: current.owed.map(o => ({ id: o.id, user_id: userId, person_name: o.personName, amount: o.amount, note: o.note, owed_at: o.date, is_paid: o.isPaid, created_at: o.createdAt })) },
    ];
    for (const table of tables) {
      const ids = table.rows.map(row => row.id);
      let remove = supabase.from(table.name).delete().eq('user_id', userId);
      if (ids.length) remove = remove.not('id', 'in', `(${ids.map(id => `"${id}"`).join(',')})`);
      const { error: deleteError } = await remove;
      // The table name is dynamic here, so Supabase cannot narrow the matching generated row union.
      const { error: saveError } = table.rows.length ? await supabase.from(table.name).upsert(table.rows as never) : { error: null };
      if (deleteError || saveError) console.error(`Could not sync ${table.name}:`, (deleteError || saveError)?.message);
    }
  }, 300);
}

export const storage = {
  connectUser: async (userId: string) => {
    activeUserId = userId;
    const [categories, transactions, spending, owed] = await Promise.all([
      supabase.from('categories').select('*').eq('user_id', userId),
      supabase.from('wallet_transactions').select('*').eq('user_id', userId),
      supabase.from('spending').select('*').eq('user_id', userId),
      supabase.from('money_owed').select('*').eq('user_id', userId),
    ]);
    const errors = [categories.error, transactions.error, spending.error, owed.error].filter(Boolean);
    if (errors.length) console.error('Could not load finance data from Supabase:', errors[0]?.message);
    if (!errors.length) {
      window.localStorage.setItem(userKey('wallet_transactions'), JSON.stringify((transactions.data ?? []).map(t => ({ id: t.id, type: t.type, amount: Number(t.amount), note: t.note, date: t.transaction_date, createdAt: t.created_at }))));
      window.localStorage.setItem(userKey('spending'), JSON.stringify((spending.data ?? []).map(s => ({ id: s.id, amount: Number(s.amount), categoryId: s.category_id, note: s.description, date: s.spent_at, createdAt: s.created_at }))));
      window.localStorage.setItem(userKey('categories'), JSON.stringify((categories.data ?? []).map(c => ({ id: c.id, name: c.name, color: c.color, icon: c.icon, isDefault: c.is_default }))));
      window.localStorage.setItem(userKey('owed'), JSON.stringify((owed.data ?? []).map(o => ({ id: o.id, personName: o.person_name, amount: Number(o.amount), note: o.note, date: o.owed_at, isPaid: o.is_paid, createdAt: o.created_at }))));
      if ((categories.data ?? []).length) {
        window.localStorage.setItem(userKey('seed_version'), JSON.stringify('empty-wallet-v1'));
        window.localStorage.setItem(userKey('seeded'), JSON.stringify(true));
      }
    }
    window.dispatchEvent(new Event('storage-update'));
  },
  disconnectUser: () => {
    clearTimeout(saveTimer);
    activeUserId = null;
    window.dispatchEvent(new Event('storage-update'));
  },
  getWalletTransactions: () => get<WalletTransaction[]>('wallet_transactions', []),
  setWalletTransactions: (txs: WalletTransaction[]) => {
    set('wallet_transactions', txs);
    // Auto-update balance when transactions change
    const balance = txs.reduce((acc, tx) => acc + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);
    set('wallet_balance', balance);
  },
  getWalletBalance: () => {
    const funds = get<WalletTransaction[]>('wallet_transactions', []).reduce((total, tx) => total + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);
    const expenses = get<SpendingTransaction[]>('spending', []).reduce((total, item) => total + item.amount, 0);
    return funds - expenses;
  },
  
  getSpending: () => get<SpendingTransaction[]>('spending', []),
  setSpending: (spendings: SpendingTransaction[]) => set('spending', spendings),
  
  getCategories: () => get<Category[]>('categories', []),
  setCategories: (categories: Category[]) => set('categories', categories),
  
  getOwed: () => get<OwedRecord[]>('owed', []),
  setOwed: (owed: OwedRecord[]) => set('owed', owed),
  
  isSeeded: () => get<boolean>('seeded', false),
  setSeeded: (seeded: boolean) => set('seeded', seeded),
  getSeedVersion: () => get<string>('seed_version', ''),
  setSeedVersion: (version: string) => set('seed_version', version),

  getSidebarCollapsed: () => get<boolean>('sidebar_collapsed', false),
  setSidebarCollapsed: (collapsed: boolean) => set('sidebar_collapsed', collapsed),
};
