import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore, ThemeMode } from '../store/settingsStore';
import { useAccountStore } from '../store/accountStore';
import { useTransactionStore } from '../store/transactionStore';
import AppHeader from '../components/AppHeader';

export default function Settings() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useSettingsStore();
  const { refreshBalances, accounts } = useAccountStore();
  const { syncTransactions } = useTransactionStore();

  const themeModes: { label: string; value: ThemeMode }[] = [
    { label: 'Auto', value: 'auto' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      padding: 16,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.onBackground,
      marginBottom: 24,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
      marginTop: 20,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 10,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    rowLabel: {
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    rowSubLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.surfaceVariant,
      marginHorizontal: 16,
    },
    themeRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 10,
    },
    themeOption: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    themeOptionActive: {
      backgroundColor: theme.colors.primary,
    },
    themeOptionText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    themeOptionTextActive: {
      color: theme.colors.onPrimary,
    },
    actionButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
    },
    actionButtonText: {
      fontSize: 15,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    institutionName: {
      fontSize: 15,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    accountCount: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    themeDivider: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.surfaceVariant,
    },
  });

  const institutions = accounts.reduce((acc, account) => {
    const name = account.plaid_items?.institution_name;
    if (name && !acc.includes(name)) acc.push(name);
    return acc;
  }, [] as string[]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Settings</Text>

        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.themeRow}>
          {themeModes.map((mode, index) => (
            <TouchableOpacity
              key={mode.value}
              style={[
                styles.themeOption,
                themeMode === mode.value && styles.themeOptionActive,
                index < themeModes.length - 1 && styles.themeDivider,
              ]}
              onPress={() => setThemeMode(mode.value)}
            >
              <Text
                style={
                  themeMode === mode.value
                    ? styles.themeOptionTextActive
                    : styles.themeOptionText
                }
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Data</Text>
        <TouchableOpacity style={styles.actionButton} onPress={refreshBalances}>
          <Text style={styles.actionButtonText}>Refresh Balances</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={syncTransactions}
        >
          <Text style={styles.actionButtonText}>Sync Transactions</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Connected Accounts</Text>
        <View style={styles.card}>
          {institutions.length === 0 ? (
            <View style={styles.row}>
              <Text style={styles.rowSubLabel}>No accounts connected</Text>
            </View>
          ) : (
            institutions.map((name, index) => {
              const count = accounts.filter(
                a => a.plaid_items?.institution_name === name,
              ).length;
              return (
                <View key={name}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.institutionName}>{name}</Text>
                      <Text style={styles.accountCount}>
                        {count} account{count !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
