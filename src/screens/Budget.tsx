import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudgetStore } from '../store/budgetStore';
import { useTransactionStore } from '../store/transactionStore';
import AppHeader from '../components/AppHeader';

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Budget() {
  const theme = useTheme();
  const {
    limits,
    spending,
    income,
    fetchLimits,
    fetchSpending,
    fetchIncome,
    setLimit,
    addManualIncome,
  } = useBudgetStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [limitCategory, setLimitCategory] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeNote, setIncomeNote] = useState('');

  useEffect(() => {
    fetchLimits();
    fetchSpending(month, year);
    fetchIncome(month, year);
    fetchTransactions();
  }, [fetchLimits, fetchSpending, fetchIncome, fetchTransactions, month, year]);

  const onRefresh = () => {
    fetchSpending(month, year);
    fetchIncome(month, year);
  };

  const overallLimit =
    limits.find(l => l.category === null)?.monthly_limit ?? null;
  const totalSpending = Object.values(spending).reduce((sum, v) => sum + v, 0);
  const savingsRate =
    income && income.total > 0
      ? Math.round(((income.total - totalSpending) / income.total) * 100)
      : null;

  const unconfirmedIncome = transactions.filter(
    t => t.is_income && !t.income_confirmed,
  );

  const openLimitModal = (category: string | null) => {
    setLimitCategory(category);
    const existing = limits.find(l => l.category === category);
    setLimitInput(existing ? String(existing.monthly_limit) : '');
    setLimitModalVisible(true);
  };

  const saveLimit = async () => {
    const amount = parseFloat(limitInput);
    if (!isNaN(amount) && amount > 0) {
      await setLimit(limitCategory, amount);
    }
    setLimitModalVisible(false);
  };

  const saveManualIncome = async () => {
    const amount = parseFloat(incomeAmount);
    if (!isNaN(amount) && amount > 0) {
      await addManualIncome({
        amount,
        source: incomeSource,
        note: incomeNote,
        income_date: new Date().toISOString().split('T')[0],
      });
    }
    setIncomeModalVisible(false);
    setIncomeAmount('');
    setIncomeSource('');
    setIncomeNote('');
  };

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
    sectionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: 20,
      marginBottom: 8,
    },
    card: {
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      marginBottom: 10,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    labelText: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    valueText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    progressBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.surfaceVariant,
      marginTop: 10,
    },
    progressBarFill: {
      height: 6,
      borderRadius: 3,
    },
    limitLabel: {
      marginTop: 6,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    limitButton: {
      marginTop: 8,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: theme.colors.primaryContainer,
    },
    limitButtonText: {
      fontSize: 12,
      color: theme.colors.onPrimaryContainer,
    },
    addButton: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryContainer,
    },
    addButtonText: {
      fontSize: 13,
      color: theme.colors.onPrimaryContainer,
      fontWeight: '500',
    },
    incomeSectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 8,
    },
    incomeSectionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    incomeRow: {
      marginTop: 8,
    },
    incomeTotalRow: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.surfaceVariant,
    },
    totalLabelText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    totalValueText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2E7D32',
    },
    savingsRatePositive: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2E7D32',
    },
    savingsRateNegative: {
      fontSize: 14,
      fontWeight: '600',
      color: '#C62828',
    },
    unconfirmedCard: {
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    unconfirmedName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    unconfirmedAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2E7D32',
    },
    confirmButton: {
      marginTop: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: '#E8F5E9',
    },
    confirmButtonText: {
      fontSize: 12,
      color: '#2E7D32',
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '100%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    modalInput: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 4,
    },
    modalCancel: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    modalCancelText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    modalSave: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
    },
    modalSaveText: {
      fontSize: 14,
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
    progressBarFillGreen: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    progressBarFillRed: {
      height: 6,
      borderRadius: 3,
      backgroundColor: '#C62828',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Budget" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.pageTitle}>Budget</Text>

        <Text style={styles.sectionLabel}>Overview</Text>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text style={styles.labelText}>Total Spending</Text>
              <Text style={styles.valueText}>
                {formatCurrency(totalSpending)}
              </Text>
            </View>
            {overallLimit && (
              <>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      totalSpending > overallLimit
                        ? styles.progressBarFillRed
                        : styles.progressBarFillGreen,
                      {
                        width: `${Math.min(
                          (totalSpending / overallLimit) * 100,
                          100,
                        ).toFixed(0)}%` as any,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.limitLabel}>
                  {formatCurrency(overallLimit)} limit
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.limitButton}
              onPress={() => openLimitModal(null)}
            >
              <Text style={styles.limitButtonText}>
                {overallLimit ? 'Edit overall limit' : 'Set overall limit'}
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {savingsRate !== null && (
          <Card style={styles.card}>
            <Card.Content style={styles.rowBetween}>
              <Text style={styles.labelText}>Savings Rate</Text>
              <Text
                style={
                  savingsRate >= 0
                    ? styles.savingsRatePositive
                    : styles.savingsRateNegative
                }
              >
                {savingsRate}%
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.incomeSectionRow}>
          <Text style={styles.incomeSectionLabel}>Income</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIncomeModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text style={styles.labelText}>From accounts</Text>
              <Text style={styles.valueText}>
                {formatCurrency(income?.from_transactions ?? 0)}
              </Text>
            </View>
            <View style={[styles.rowBetween, styles.incomeRow]}>
              <Text style={styles.labelText}>Manual</Text>
              <Text style={styles.valueText}>
                {formatCurrency(income?.from_manual ?? 0)}
              </Text>
            </View>
            <View style={[styles.rowBetween, styles.incomeTotalRow]}>
              <Text style={styles.totalLabelText}>Total</Text>
              <Text style={styles.totalValueText}>
                {formatCurrency(income?.total ?? 0)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {unconfirmedIncome.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Confirm Income</Text>
            {unconfirmedIncome.map(txn => (
              <Card key={txn.id} style={styles.unconfirmedCard}>
                <Card.Content>
                  <View style={styles.rowBetween}>
                    <Text style={styles.unconfirmedName}>{txn.name}</Text>
                    <Text style={styles.unconfirmedAmount}>
                      {formatCurrency(Math.abs(txn.amount))}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() =>
                      useTransactionStore.getState().confirmIncome(txn.id, true)
                    }
                  >
                    <Text style={styles.confirmButtonText}>
                      Confirm as income
                    </Text>
                  </TouchableOpacity>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        <Text style={styles.sectionLabel}>Spending by Category</Text>
        {Object.keys(spending).length === 0 ? (
          <Text style={styles.emptyText}>No spending data yet</Text>
        ) : (
          Object.entries(spending)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
              const categoryLimit =
                limits.find(l => l.category === category)?.monthly_limit ??
                null;
              return (
                <Card key={category} style={styles.card}>
                  <Card.Content>
                    <View style={styles.rowBetween}>
                      <Text style={styles.labelText}>{category}</Text>
                      <Text style={styles.valueText}>
                        {formatCurrency(amount)}
                      </Text>
                    </View>
                    {categoryLimit && (
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            amount > categoryLimit
                              ? styles.progressBarFillRed
                              : styles.progressBarFillGreen,
                            {
                              width: `${Math.min(
                                (amount / categoryLimit) * 100,
                                100,
                              ).toFixed(0)}%` as any,
                            },
                          ]}
                        />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.limitButton}
                      onPress={() => openLimitModal(category)}
                    >
                      <Text style={styles.limitButtonText}>
                        {categoryLimit
                          ? `${formatCurrency(categoryLimit)} limit`
                          : 'Set limit'}
                      </Text>
                    </TouchableOpacity>
                  </Card.Content>
                </Card>
              );
            })
        )}
      </ScrollView>

      <Modal visible={limitModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {limitCategory
                ? `Limit for ${limitCategory}`
                : 'Overall Monthly Limit'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Amount"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType="numeric"
              value={limitInput}
              onChangeText={setLimitInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setLimitModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveLimit}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={incomeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Manual Income</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Amount"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType="numeric"
              value={incomeAmount}
              onChangeText={setIncomeAmount}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Source (e.g. Venmo, Cash)"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={incomeSource}
              onChangeText={setIncomeSource}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Note (optional)"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={incomeNote}
              onChangeText={setIncomeNote}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setIncomeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={saveManualIncome}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
