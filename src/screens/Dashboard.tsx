import React, { useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, useTheme } from 'react-native-paper';
import { useAccountStore } from '../store/accountStore';
import { useTransactionStore } from '../store/transactionStore';
import { useBudgetStore } from '../store/budgetStore';
import AppHeader from '../components/AppHeader';

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Dashboard() {
  const theme = useTheme();
  const {
    accounts,
    fetchAccounts,
    refreshBalances,
    loading: accountsLoading,
  } = useAccountStore();
  const { fetchTransactions } = useTransactionStore();
  const { spending, income, fetchSpending, fetchIncome } = useBudgetStore();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const load = useCallback(async () => {
    await Promise.all([
      fetchAccounts(),
      fetchTransactions(),
      fetchSpending(month, year),
      fetchIncome(month, year),
    ]);
  }, [
    fetchAccounts,
    fetchTransactions,
    fetchSpending,
    fetchIncome,
    month,
    year,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const netWorth = accounts.reduce(
    (sum, a) => sum + (a.current_balance ?? 0),
    0,
  );

  const monthlySpending = Object.values(spending).reduce(
    (sum, v) => sum + v,
    0,
  );

  const savingsRate =
    income && income.total > 0
      ? Math.round(((income.total - monthlySpending) / income.total) * 100)
      : null;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      padding: 16,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 24,
      marginBottom: 8,
    },
    netWorthCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      padding: 24,
      marginBottom: 8,
    },
    netWorthLabel: {
      fontSize: 14,
      color: theme.colors.onPrimary,
      opacity: 0.8,
    },
    netWorthAmount: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.colors.onPrimary,
      marginTop: 4,
    },
    card: {
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    accountName: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    accountInstitution: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    accountBalance: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    statRow: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      padding: 16,
      marginTop: 12,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Dashboard" />
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="dark-content"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={accountsLoading}
            onRefresh={refreshBalances}
          />
        }
      >
        <View style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Net Worth</Text>
          <Text style={styles.netWorthAmount}>{formatCurrency(netWorth)}</Text>
        </View>

        <Text style={styles.sectionLabel}>Accounts</Text>
        {accounts.map(account => (
          <Card key={account.id} style={styles.card}>
            <Card.Content style={styles.cardRow}>
              <View>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountInstitution}>
                  {account.plaid_items?.institution_name}
                </Text>
              </View>
              <Text style={styles.accountBalance}>
                {formatCurrency(account.current_balance ?? 0)}
              </Text>
            </Card.Content>
          </Card>
        ))}

        <Text style={styles.sectionLabel}>This Month</Text>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Spending</Text>
            <Text style={styles.statValue}>
              {formatCurrency(monthlySpending)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>
              {income ? formatCurrency(income.total) : '$0'}
            </Text>
          </View>
        </View>

        {savingsRate !== null && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Savings Rate</Text>
            <Text style={styles.statValue}>{savingsRate}%</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
