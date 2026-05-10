import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Dashboard from '../screens/Dashboard';
import Accounts from '../screens/Accounts';
import Investments from '../screens/Investments';
import Transactions from '../screens/Transactions';
import Budget from '../screens/Budget';
import Settings from '../screens/Settings';

const Tab = createBottomTabNavigator();
const MdiIcon =
  require('@react-native-vector-icons/material-design-icons').default;

const icons: Record<string, string> = {
  Dashboard: 'view-dashboard',
  Accounts: 'bank',
  Investments: 'chart-line',
  Transactions: 'format-list-bulleted',
  Budget: 'wallet',
};

export default function BottomTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
        },
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <MdiIcon name={icons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Accounts" component={Accounts} />
      <Tab.Screen name="Investments" component={Investments} />
      <Tab.Screen name="Transactions" component={Transactions} />
      <Tab.Screen name="Budget" component={Budget} />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none', width: 0 },
        }}
      />
    </Tab.Navigator>
  );
}
