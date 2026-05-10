import React, { useEffect, useRef } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { lightTheme, darkTheme } from './src/theme';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import DrawerMenu from './src/components/DrawerMenu';
import { useSettingsStore } from './src/store/settingsStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const systemColorScheme = useColorScheme();
  const { themeMode, loadSettings } = useSettingsStore();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const resolvedScheme = themeMode === 'auto' ? systemColorScheme : themeMode;
  const theme = resolvedScheme === 'dark' ? darkTheme : lightTheme;

  const handleNavigate = (screen: string) => {
    navigationRef.current?.navigate(screen as never);
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer ref={navigationRef}>
          <View style={StyleSheet.absoluteFill}>
            <BottomTabNavigator />
            <DrawerMenu onNavigate={handleNavigate} />
          </View>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
