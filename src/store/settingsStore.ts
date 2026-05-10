import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'auto' | 'light' | 'dark';

interface SettingsStore {
  themeMode: ThemeMode;
  drawerOpen: boolean;
  loaded: boolean;
  loadSettings: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  themeMode: 'auto',
  drawerOpen: false,
  loaded: false,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem('themeMode');
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        set({ themeMode: stored, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  setThemeMode: async (mode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      set({ themeMode: mode });
    } catch {
      set({ themeMode: mode });
    }
  },

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
}));