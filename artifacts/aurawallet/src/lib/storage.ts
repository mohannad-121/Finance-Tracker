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

const get = <T>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${PREFIX + key}":`, error);
    return defaultValue;
  }
};

const set = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new Event('storage-update')); // trigger custom event for reactivity
  } catch (error) {
    console.warn(`Error setting localStorage key "${PREFIX + key}":`, error);
  }
};

export const storage = {
  getWalletTransactions: () => get<WalletTransaction[]>('wallet_transactions', []),
  setWalletTransactions: (txs: WalletTransaction[]) => {
    set('wallet_transactions', txs);
    // Auto-update balance when transactions change
    const balance = txs.reduce((acc, tx) => acc + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);
    set('wallet_balance', balance);
  },
  getWalletBalance: () => get<number>('wallet_balance', 0),
  
  getSpending: () => get<SpendingTransaction[]>('spending', []),
  setSpending: (spendings: SpendingTransaction[]) => set('spending', spendings),
  
  getCategories: () => get<Category[]>('categories', []),
  setCategories: (categories: Category[]) => set('categories', categories),
  
  getOwed: () => get<OwedRecord[]>('owed', []),
  setOwed: (owed: OwedRecord[]) => set('owed', owed),
  
  isSeeded: () => get<boolean>('seeded', false),
  setSeeded: (seeded: boolean) => set('seeded', seeded),

  getSidebarCollapsed: () => get<boolean>('sidebar_collapsed', false),
  setSidebarCollapsed: (collapsed: boolean) => set('sidebar_collapsed', collapsed),
};
