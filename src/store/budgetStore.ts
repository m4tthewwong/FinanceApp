import { create } from 'zustand';
import { api } from '../utils/api';

export interface BudgetLimit {
  id: string;
  user_id: string;
  category: string | null;
  monthly_limit: number;
  updated_at: string;
}

export interface SpendingByCategory {
  [category: string]: number;
}

export interface IncomeData {
  from_transactions: number;
  from_manual: number;
  total: number;
}

interface BudgetStore {
  limits: BudgetLimit[];
  spending: SpendingByCategory;
  income: IncomeData | null;
  loading: boolean;
  error: string | null;
  fetchLimits: () => Promise<void>;
  setLimit: (category: string | null, monthly_limit: number) => Promise<void>;
  fetchSpending: (month: number, year: number) => Promise<void>;
  fetchIncome: (month: number, year: number) => Promise<void>;
  addManualIncome: (params: {
    amount: number;
    source: string;
    note?: string;
    income_date: string;
  }) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  limits: [],
  spending: {},
  income: null,
  loading: false,
  error: null,

  fetchLimits: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/budget/limits');
      set({ limits: data as BudgetLimit[], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  setLimit: async (category, monthly_limit) => {
    try {
      const data = await api.post('/budget/limits', { category, monthly_limit });
      set((state) => {
        const exists = state.limits.find((l) => l.category === category);
        if (exists) {
          return {
            limits: state.limits.map((l) =>
              l.category === category ? (data as BudgetLimit) : l
            ),
          };
        }
        return { limits: [...state.limits, data as BudgetLimit] };
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchSpending: async (month, year) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(`/budget/spending?month=${month}&year=${year}`);
      set({ spending: data as SpendingByCategory, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchIncome: async (month, year) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(`/budget/income?month=${month}&year=${year}`);
      set({ income: data as IncomeData, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  addManualIncome: async ({ amount, source, note, income_date }) => {
    try {
      await api.post('/budget/income/manual', { amount, source, note, income_date });
      const now = new Date();
      await useBudgetStore
        .getState()
        .fetchIncome(now.getMonth() + 1, now.getFullYear());
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));