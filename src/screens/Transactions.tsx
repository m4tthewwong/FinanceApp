import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '../store/transactionStore';
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

export default function Transactions() {
  const theme = useTheme();
  const { transactions, fetchTransactions, syncTransactions, loading } =
    useTransactionStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const categories = [
    ...new Set(
      transactions
        .map(t => t.overridden_category ?? t.plaid_category)
        .filter(Boolean) as string[],
    ),
  ].sort();

  const filtered = transactions.filter(t => {
    const matchesSearch = search
      ? t.name.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesCategory = selectedCategory
      ? (t.overridden_category ?? t.plaid_category) === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      paddingBottom: 8,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.onBackground,
      marginBottom: 12,
    },
    searchBox: {
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: theme.colors.onSurface,
      marginBottom: 10,
    },
    categoryScroll: {
      marginBottom: 8,
    },
    categoryChip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: theme.colors.surface,
    },
    categoryChipActive: {
      backgroundColor: theme.colors.primary,
    },
    categoryChipText: {
      fontSize: 13,
      color: theme.colors.onSurface,
    },
    categoryChipTextActive: {
      color: theme.colors.onPrimary,
    },
    scroll: {
      padding: 16,
      paddingTop: 4,
    },
    txnCard: {
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    txnRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    txnName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
      flex: 1,
      marginRight: 8,
    },
    txnCategory: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      marginTop: 3,
    },
    txnAccount: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      marginTop: 1,
    },
    txnRight: {
      alignItems: 'flex-end',
    },
    txnAmount: {
      fontSize: 15,
      fontWeight: '600',
    },
    txnDate: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      marginTop: 3,
    },
    pendingBadge: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
      fontStyle: 'italic',
    },
    emptyText: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 40,
    },
    syncButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryContainer,
      marginBottom: 8,
    },
    syncButtonText: {
      fontSize: 13,
      color: theme.colors.onPrimaryContainer,
      fontWeight: '500',
    },
    txnContent: {
      flex: 1,
    },
    txnAmountDebit: {
      fontSize: 15,
      fontWeight: '600',
      color: '#C62828',
    },
    txnAmountCredit: {
      fontSize: 15,
      fontWeight: '600',
      color: '#2E7D32',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Transactions" />
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Transactions</Text>
        <TextInput
          style={styles.searchBox}
          placeholder="Search transactions..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.syncButton} onPress={syncTransactions}>
          <Text style={styles.syncButtonText}>Sync</Text>
        </TouchableOpacity>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === null && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === null && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTransactions} />
        }
      >
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No transactions found</Text>
        ) : (
          filtered.map(txn => (
            <Card key={txn.id} style={styles.txnCard}>
              <Card.Content style={styles.txnRow}>
                <View style={styles.txnContent}>
                  <Text style={styles.txnName} numberOfLines={1}>
                    {txn.name}
                  </Text>
                  <Text style={styles.txnCategory}>
                    {txn.overridden_category ??
                      txn.plaid_category ??
                      'Uncategorized'}
                  </Text>
                  <Text style={styles.txnAccount}>{txn.accounts?.name}</Text>
                </View>
                <View style={styles.txnRight}>
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
                  <Text style={styles.txnDate}>{formatDate(txn.date)}</Text>
                  {txn.pending && (
                    <Text style={styles.pendingBadge}>Pending</Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
