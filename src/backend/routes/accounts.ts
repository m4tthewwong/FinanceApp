import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';
import { plaidClient } from '../services/plaidService';

const router = Router();

// Get all accounts from Supabase
router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*, plaid_items(institution_name)')
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Refresh balances from Plaid for all accounts
router.post('/refresh-balances', async (_req: Request, res: Response) => {
  const { data: items, error: itemsError } = await supabase
    .from('plaid_items')
    .select('*');

  if (itemsError) return res.status(500).json({ error: itemsError.message });

  for (const item of items) {
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: item.access_token,
    });

    const accounts = balanceResponse.data.accounts;

    for (const account of accounts) {
      await supabase
        .from('accounts')
        .update({
          current_balance: account.balances.current,
          available_balance: account.balances.available,
          last_balance_fetch: new Date().toISOString(),
        })
        .eq('plaid_account_id', account.account_id);
    }

    await supabase
      .from('plaid_items')
      .update({ last_balance_fetch: new Date().toISOString() })
      .eq('id', item.id);
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('*, plaid_items(institution_name)');

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

export default router;