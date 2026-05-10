import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInvestmentStore } from '../store/investmentStore';
import AppHeader from '../components/AppHeader';

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatCurrency(change)}`;
}

function formatChangePercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export default function Investments() {
  const theme = useTheme();
  const { holdings, fetchHoldings, loading } = useInvestmentStore();

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0);
  const totalDailyChange = holdings.reduce(
    (sum, h) => sum + h.daily_change * h.quantity,
    0,
  );

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
      marginBottom: 4,
    },
    totalValue: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.colors.onBackground,
      marginBottom: 4,
    },
    dailyChange: {
      fontSize: 14,
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    holdingCard: {
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      marginBottom: 10,
    },
    holdingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ticker: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    holdingName: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    quantity: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    rightColumn: {
      alignItems: 'flex-end',
    },
    totalHoldingValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    priceRow: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    changeRow: {
      fontSize: 12,
      marginTop: 2,
    },
    emptyText: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Investments" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchHoldings} />
        }
      >
        <Text style={styles.pageTitle}>Investments</Text>
        <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
        <Text
          style={[
            styles.dailyChange,
            {
              color:
                totalDailyChange === 0
                  ? theme.colors.onSurfaceVariant
                  : totalDailyChange > 0
                  ? '#2E7D32'
                  : '#C62828',
            },
          ]}
        >
          {formatChange(totalDailyChange)} today
        </Text>

        <Text style={styles.sectionLabel}>Holdings</Text>

        {holdings.length === 0 ? (
          <Text style={styles.emptyText}>No holdings yet</Text>
        ) : (
          holdings.map(holding => (
            <Card key={holding.id} style={styles.holdingCard}>
              <Card.Content style={styles.holdingRow}>
                <View>
                  <Text style={styles.ticker}>{holding.ticker}</Text>
                  <Text style={styles.holdingName} numberOfLines={1}>
                    {holding.name ?? holding.ticker}
                  </Text>
                  <Text style={styles.quantity}>{holding.quantity} shares</Text>
                </View>
                <View style={styles.rightColumn}>
                  <Text style={styles.totalHoldingValue}>
                    {formatCurrency(holding.total_value)}
                  </Text>
                  <Text style={styles.priceRow}>
                    {formatCurrency(holding.current_price)} / share
                  </Text>
                  <Text
                    style={[
                      styles.changeRow,
                      {
                        color:
                          holding.daily_change === 0
                            ? theme.colors.onSurfaceVariant
                            : holding.daily_change > 0
                            ? '#2E7D32'
                            : '#C62828',
                      },
                    ]}
                  >
                    {formatChange(holding.daily_change)}{' '}
                    {formatChangePercent(holding.daily_change_percent)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
