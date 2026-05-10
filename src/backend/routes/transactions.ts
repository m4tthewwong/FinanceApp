import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';
import { plaidClient } from '../services/plaidService';

const router = Router();

// Get all transactions from Supabase
router.get('/', async (req: Request, res: Response) => {
  const { account_id, category, search } = req.query;

  let query = supabase
    .from('transactions')
    .select('*, accounts(name, plaid_items(institution_name)), transaction_tags(tag)')
    .order('date', { ascending: false });

  if (account_id) query = query.eq('account_id', account_id);
  if (category) {
    query = query.or(
      `plaid_category.eq.${category},overridden_category.eq.${category}`
    );
  }
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Sync transactions from Plaid
router.post('/sync', async (_req: Request, res: Response) => {
  const { data: items, error: itemsError } = await supabase
    .from('plaid_items')
    .select('*');

  if (itemsError) return res.status(500).json({ error: itemsError.message });

  for (const item of items) {
    const response = await plaidClient.transactionsSync({
      access_token: item.access_token,
    });

    const added = response.data.added;

    for (const txn of added) {
      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('plaid_account_id', txn.account_id)
        .single();

      if (!account) continue;

      const isLargeDeposit = txn.amount < -500;

      await supabase.from('transactions').upsert({
        user_id: process.env.USER_ID,
        account_id: account.id,
        plaid_transaction_id: txn.transaction_id,
        name: txn.name,
        amount: txn.amount,
        date: txn.date,
        plaid_category: txn.personal_finance_category?.primary ?? null,
        pending: txn.pending,
        is_income: isLargeDeposit,
        income_confirmed: false,
      }, { onConflict: 'plaid_transaction_id' });
    }

    await supabase
      .from('plaid_items')
      .update({ last_transaction_sync: new Date().toISOString() })
      .eq('id', item.id);
  }

  return res.json({ success: true });
});

// Override a transaction's category
router.patch('/:id/category', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { category } = req.body;

  const { data, error } = await supabase
    .from('transactions')
    .update({ overridden_category: category })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Confirm a transaction as income
router.patch('/:id/confirm-income', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { confirmed } = req.body;

  const { data, error } = await supabase
    .from('transactions')
    .update({ is_income: confirmed, income_confirmed: confirmed })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Add or remove a tag on a transaction
router.post('/:id/tags', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tag } = req.body;

  const { data, error } = await supabase
    .from('transaction_tags')
    .upsert({ transaction_id: id, tag }, { onConflict: 'transaction_id,tag' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/:id/tags/:tag', async (req: Request, res: Response) => {
  const { id, tag } = req.params;

  const { error } = await supabase
    .from('transaction_tags')
    .delete()
    .eq('transaction_id', id)
    .eq('tag', tag);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

export default router;