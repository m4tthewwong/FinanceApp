import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccountStore } from '../store/accountStore';
import { useTransactionStore } from '../store/transactionStore';
import PlaidLink from '../components/PlaidLink';
import AppHeader from '../components/AppHeader';

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function Accounts() {
  const theme = useTheme();
  const { accounts, refreshBalances, loading } = useAccountStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    refreshBalances();
    fetchTransactions();
  }, [refreshBalances, fetchTransactions]);

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
      marginBottom: 16,
    },
    accountCard: {
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      marginBottom: 20,
    },
    accountHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    institutionName: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 2,
    },
    accountName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    accountSubtype: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
      textTransform: 'capitalize',
    },
    balanceColumn: {
      alignItems: 'flex-end',
    },
    balanceLabel: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    balanceAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    availableAmount: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    txnRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    txnName: {
      fontSize: 14,
      color: theme.colors.onSurface,
      flex: 1,
      marginRight: 8,
    },
    txnMeta: {
      alignItems: 'flex-end',
    },
    txnAmountDebit: {
      fontSize: 14,
      fontWeight: '500',
      color: '#C62828',
    },
    txnAmountCredit: {
      fontSize: 14,
      fontWeight: '500',
      color: '#2E7D32',
    },
    txnDate: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    emptyText: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
    linkButton: {
      marginBottom: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Accounts" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshBalances} />
        }
      >
        <Text style={styles.pageTitle}>Accounts</Text>
        <View style={styles.linkButton}>
          <PlaidLink onSuccess={fetchTransactions} />
        </View>

        {accounts.map(account => {
          const accountTxns = transactions
            .filter(t => t.account_id === account.id && !t.pending)
            .slice(0, 5);

          return (
            <Card key={account.id} style={styles.accountCard}>
              <Card.Content>
                <View style={styles.accountHeader}>
                  <View>
                    <Text style={styles.institutionName}>
                      {account.plaid_items?.institution_name}
                    </Text>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountSubtype}>{account.subtype}</Text>
                  </View>
                  <View style={styles.balanceColumn}>
                    <Text style={styles.balanceLabel}>Current</Text>
                    <Text style={styles.balanceAmount}>
                      {formatCurrency(account.current_balance ?? 0)}
                    </Text>
                    {account.available_balance !== null && (
                      <Text style={styles.availableAmount}>
                        {formatCurrency(account.available_balance)} available
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionLabel}>Recent Transactions</Text>

                {accountTxns.length === 0 ? (
                  <Text style={styles.emptyText}>No transactions yet</Text>
                ) : (
                  accountTxns.map(txn => (
                    <View key={txn.id} style={styles.txnRow}>
                      <Text style={styles.txnName} numberOfLines={1}>
                        {txn.name}
                      </Text>
                      <View style={styles.txnMeta}>
                        <Text
                          style={
                            txn.amount < 0
                              ? styles.txnAmountCredit
                              : styles.txnAmountDebit
                          }
                        >
                          {txn.amount < 0
                            ? `+${formatCurrency(Math.abs(txn.amount))}`
                            : `-${formatCurrency(txn.amount)}`}
                        </Text>
                        <Text style={styles.txnDate}>
                          {formatDate(txn.date)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </Card.Content>
            </Card>
          );
        })}

        {accounts.length === 0 && (
          <Text style={styles.emptyText}>No accounts connected yet</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}