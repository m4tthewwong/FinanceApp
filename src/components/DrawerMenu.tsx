import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSettingsStore } from '../store/settingsStore';

const MdiIcon =
  require('@react-native-vector-icons/material-design-icons').default;
const DRAWER_WIDTH = 240;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface DrawerItem {
  label: string;
  icon: string;
  onPress: () => void;
}

interface DrawerMenuProps {
  onNavigate: (screen: string) => void;
}

export default function DrawerMenu({ onNavigate }: DrawerMenuProps) {
  const theme = useTheme();
  const { drawerOpen, closeDrawer } = useSettingsStore();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (drawerOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [drawerOpen, opacity, translateX]);

  const items: DrawerItem[] = [
    {
      label: 'Settings',
      icon: 'cog',
      onPress: () => {
        closeDrawer();
        onNavigate('Settings');
      },
    },
  ];

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: SCREEN_WIDTH,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: DRAWER_WIDTH,
      bottom: 0,
      backgroundColor: theme.colors.surface,
      paddingTop: 60,
      paddingHorizontal: 20,
      elevation: 16,
    },
    drawerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: 32,
      paddingLeft: 8,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 4,
      alignSelf: 'flex-start',
      minWidth: 160,
    },
    itemLabel: {
      fontSize: 16,
      color: theme.colors.onSurface,
      marginLeft: 16,
      fontWeight: '500',
    },
  });

  if (!drawerOpen) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <Text style={styles.drawerTitle}>Finance App</Text>
        {items.map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            onPress={item.onPress}
          >
            <MdiIcon
              name={item.icon}
              size={22}
              color={theme.colors.onSurface}
            />
            <Text style={styles.itemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
}
