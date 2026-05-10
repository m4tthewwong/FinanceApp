import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSettingsStore } from '../store/settingsStore';

const MdiIcon = require('@react-native-vector-icons/material-design-icons').default;

interface AppHeaderProps {
  title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  const theme = useTheme();
  const { openDrawer } = useSettingsStore();

  const styles = StyleSheet.create({
    header: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceVariant,
    },
    iconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={openDrawer}>
        <MdiIcon name="menu" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.avatar}>
        <MdiIcon name="account" size={20} color={theme.colors.onSurfaceVariant} />
      </View>
    </View>
  );
}