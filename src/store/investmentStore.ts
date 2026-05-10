import { create } from 'zustand';
import { api } from '../utils/api';

export interface Holding {
  id: string;
  account_id: string;
  ticker: string;
  name: string | null;
  quantity: number;
  cost_basis: number | null;
  current_price: number;
  daily_change: number;
  daily_change_percent: number;
  total_value: number;
  accounts: {
    name: string;
  };
}

export interface InvestmentSnapshot {
  id: string;
  account_id: string;
  snapshot_date: string;
  total_value: number;
}

interface InvestmentStore {
  holdings: Holding[];
  snapshots: InvestmentSnapshot[];
  loading: boolean;
  error: string | null;
  fetchHoldings: () => Promise<void>;
  fetchSnapshots: (accountId: string) => Promise<void>;
}

export const useInvestmentStore = create<InvestmentStore>((set) => ({
  holdings: [],
  snapshots: [],
  loading: false,
  error: null,

  fetchHoldings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/investments/holdings');
      set({ holdings: data as Holding[], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchSnapshots: async (accountId) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(`/investments/snapshots/${accountId}`);
      set({ snapshots: data as InvestmentSnapshot[], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));