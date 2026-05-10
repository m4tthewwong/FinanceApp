import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    secondary: '#625B71',
    background: '#F6F6F6',
    surface: '#FFFFFF',
    error: '#B3261E',
    positive: '#2E7D32',
    negative: '#C62828',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF',
    secondary: '#CCC2DC',
    background: '#1C1B1F',
    surface: '#2B2930',
    error: '#F2B8B5',
    positive: '#81C784',
    negative: '#EF9A9A',
  },
};

export type AppTheme = typeof lightTheme;