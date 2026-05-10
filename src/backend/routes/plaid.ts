import { Router, Request, Response } from 'express';
import { plaidClient } from '../services/plaidService';
import { supabase } from '../db/supabase';
import { Products, CountryCode } from 'plaid';

const router = Router();

// Create a link token to initialize Plaid Link
router.post('/create-link-token', async (_req: Request, res: Response) => {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: process.env.USER_ID! },
    client_name: 'Finance App',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
  });

  return res.json({ link_token: response.data.link_token });
});

// Exchange public token for access token after Plaid Link success
router.post('/exchange-token', async (req: Request, res: Response) => {
  try {
    const { public_token, institution_id, institution_name } = req.body;

    let accessToken: string;
    try {
      const exchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token,
      });
      accessToken = exchangeResponse.data.access_token;
    } catch (e: any) {
      console.error('Step 1 failed:', e?.response?.data ?? e?.message ?? e);
      return res.status(500).json({ error: 'Token exchange failed' });
    }

    let item: any;
    try {
      const { data, error: itemError } = await supabase
        .from('plaid_items')
        .insert({
          user_id: process.env.USER_ID,
          institution_id,
          institution_name,
          access_token: accessToken,
        })
        .select()
        .single();

      if (itemError) {
        console.error('Step 2 failed:', itemError.message);
        return res.status(500).json({ error: itemError.message });
      }
      item = data;
    } catch (e: any) {
      console.error('Step 2 exception:', e?.message ?? e);
      return res.status(500).json({ error: 'Item insert failed' });
    }

    try {
      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
      });

      for (const account of accountsResponse.data.accounts) {
        await supabase.from('accounts').upsert({
          user_id: process.env.USER_ID,
          plaid_item_id: item.id,
          plaid_account_id: account.account_id,
          name: account.name,
          official_name: account.official_name,
          type: account.type,
          subtype: account.subtype,
          current_balance: account.balances.current,
          available_balance: account.balances.available,
          last_balance_fetch: new Date().toISOString(),
        }, { onConflict: 'plaid_account_id' });
      }
    } catch (e: any) {
      console.error('Step 3 failed:', e?.response?.data ?? e?.message ?? e);
      return res.status(500).json({ error: 'Accounts fetch failed' });
    }

    return res.json({ success: true });
  } catch (e: any) {
    console.error('Exchange token error:', e?.response?.data ?? e?.message ?? e);
    return res.status(500).json({ error: e?.message ?? 'Unknown error' });
  }
});

export default router;
