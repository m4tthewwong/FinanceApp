import { create } from 'zustand';
import { api } from '../utils/api';

export interface Transaction {
  id: string;
  account_id: string;
  plaid_transaction_id: string;
  name: string;
  amount: number;
  date: string;
  plaid_category: string | null;
  overridden_category: string | null;
  is_income: boolean;
  income_confirmed: boolean;
  pending: boolean;
  accounts: {
    name: string;
    plaid_items: {
      institution_name: string;
    };
  };
  transaction_tags: { tag: string }[];
}

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchTransactions: (filters?: {
    account_id?: string;
    category?: string;
    search?: string;
  }) => Promise<void>;
  syncTransactions: () => Promise<void>;
  overrideCategory: (id: string, category: string) => Promise<void>;
  confirmIncome: (id: string, confirmed: boolean) => Promise<void>;
  addTag: (id: string, tag: string) => Promise<void>;
  removeTag: (id: string, tag: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.account_id) params.append('account_id', filters.account_id);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await api.get(`/transactions${query}`);
      set({ transactions: data as Transaction[], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  syncTransactions: async () => {
    set({ loading: true, error: null });
    try {
      await api.post('/transactions/sync', {});
      const data = await api.get('/transactions');
      set({ transactions: data as Transaction[], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  overrideCategory: async (id, category) => {
    try {
      await api.patch(`/transactions/${id}/category`, { category });
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, overridden_category: category } : t
        ),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  confirmIncome: async (id, confirmed) => {
    try {
      await api.patch(`/transactions/${id}/confirm-income`, { confirmed });
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, is_income: confirmed, income_confirmed: confirmed } : t
        ),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  addTag: async (id, tag) => {
    try {
      await api.post(`/transactions/${id}/tags`, { tag });
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id
            ? { ...t, transaction_tags: [...t.transaction_tags, { tag }] }
            : t
        ),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  removeTag: async (id, tag) => {
    try {
      await api.delete(`/transactions/${id}/tags/${tag}`);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id
            ? { ...t, transaction_tags: t.transaction_tags.filter((tg) => tg.tag !== tag) }
            : t
        ),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));