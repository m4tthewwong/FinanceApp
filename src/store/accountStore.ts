import { create } from 'zustand';
import { api } from '../utils/api';

export interface Account {
  id: string;
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  current_balance: number;
  available_balance: number | null;
  iso_currency_code: string;
  last_balance_fetch: string | null;
  plaid_items: {
    institution_name: string;
  };
}

interface AccountStore {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  refreshBalances: () => Promise<void>;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/accounts');
      set({ accounts: data as Account[], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  refreshBalances: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/accounts/refresh-balances', {});
      set({ accounts: data as Account[], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));