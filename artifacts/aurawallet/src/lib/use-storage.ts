import { useState, useEffect } from 'react';
import { storage } from './storage';

export function useStorageData() {
  const [data, setData] = useState({
    walletTransactions: storage.getWalletTransactions(),
    walletBalance: storage.getWalletBalance(),
    spending: storage.getSpending(),
    categories: storage.getCategories(),
    owed: storage.getOwed()
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      setData({
        walletTransactions: storage.getWalletTransactions(),
        walletBalance: storage.getWalletBalance(),
        spending: storage.getSpending(),
        categories: storage.getCategories(),
        owed: storage.getOwed()
      });
    };

    window.addEventListener('storage-update', handleStorageUpdate);
    return () => window.removeEventListener('storage-update', handleStorageUpdate);
  }, []);

  return data;
}
