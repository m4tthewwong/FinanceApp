import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import {
  create,
  open,
  dismissLink,
  LinkSuccess,
  LinkExit,
  LinkTokenConfiguration,
} from 'react-native-plaid-link-sdk';
import { api } from '../utils/api';
import { useAccountStore } from '../store/accountStore';

interface PlaidLinkProps {
  onSuccess?: () => void;
}

export default function PlaidLink({ onSuccess }: PlaidLinkProps) {
  const theme = useTheme();
  const { fetchAccounts } = useAccountStore();
  const [loading, setLoading] = useState(false);

  const openPlaidLink = async () => {
    setLoading(true);
    try {
      const response = (await api.post('/plaid/create-link-token', {})) as {
        link_token: string;
      };
      const link_token = response.link_token;

      const tokenConfig: LinkTokenConfiguration = {
        token: link_token,
        noLoadingState: false,
      };

      create(tokenConfig);

      open({
        onSuccess: async (success: LinkSuccess) => {
          const metadata = success.metadata;
          await api.post('/plaid/exchange-token', {
            public_token: success.publicToken,
            institution_id: metadata.institution?.id ?? '',
            institution_name: metadata.institution?.name ?? '',
          });
          await fetchAccounts();
          onSuccess?.();
          setLoading(false);
        },
        onExit: (exit: LinkExit) => {
          if (exit.error) {
            console.error('Plaid Link error:', exit.error);
          }
          dismissLink();
          setLoading(false);
        },
      });
    } catch (e) {
      console.error('Failed to open Plaid Link:', e);
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={openPlaidLink}
      disabled={loading}
    >
      <Text style={styles.buttonText}>
        {loading ? 'Connecting...' : 'Connect Bank Account'}
      </Text>
    </TouchableOpacity>
  );
}
