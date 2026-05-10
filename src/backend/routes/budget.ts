import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

// Get all budget limits
router.get('/limits', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('budget_limits')
    .select('*')
    .eq('user_id', process.env.USER_ID);

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Set a budget limit (overall or per-category)
router.post('/limits', async (req: Request, res: Response) => {
  const { category, monthly_limit } = req.body;

  const { data, error } = await supabase
    .from('budget_limits')
    .upsert({
      user_id: process.env.USER_ID,
      category: category ?? null,
      monthly_limit,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,category' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Get spending totals by category for a given month
router.get('/spending', async (req: Request, res: Response) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'month and year are required' });
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(Number(year), Number(month), 0)
    .toISOString()
    .split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, plaid_category, overridden_category')
    .eq('user_id', process.env.USER_ID)
    .eq('is_income', false)
    .eq('pending', false)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) return res.status(500).json({ error: error.message });

  const spending: Record<string, number> = {};

  for (const txn of data) {
    const category = txn.overridden_category ?? txn.plaid_category ?? 'Uncategorized';
    spending[category] = (spending[category] ?? 0) + Math.abs(txn.amount);
  }

  return res.json(spending);
});

// Get income for a given month (confirmed transactions + manual)
router.get('/income', async (req: Request, res: Response) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'month and year are required' });
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(Number(year), Number(month), 0)
    .toISOString()
    .split('T')[0];

  const { data: txnIncome, error: txnError } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', process.env.USER_ID)
    .eq('is_income', true)
    .eq('income_confirmed', true)
    .gte('date', startDate)
    .lte('date', endDate);

  if (txnError) return res.status(500).json({ error: txnError.message });

  const { data: manualIncome, error: manualError } = await supabase
    .from('manual_income')
    .select('amount')
    .eq('user_id', process.env.USER_ID)
    .gte('income_date', startDate)
    .lte('income_date', endDate);

  if (manualError) return res.status(500).json({ error: manualError.message });

  const fromTransactions = txnIncome.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const fromManual = manualIncome.reduce((sum, t) => sum + t.amount, 0);

  return res.json({
    from_transactions: fromTransactions,
    from_manual: fromManual,
    total: fromTransactions + fromManual,
  });
});

// Add manual income entry
router.post('/income/manual', async (req: Request, res: Response) => {
  const { amount, source, note, income_date } = req.body;

  const { data, error } = await supabase
    .from('manual_income')
    .insert({
      user_id: process.env.USER_ID,
      amount,
      source,
      note,
      income_date,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Get unconfirmed probable income transactions
router.get('/income/unconfirmed', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, accounts(name)')
    .eq('user_id', process.env.USER_ID)
    .eq('is_income', true)
    .eq('income_confirmed', false)
    .order('date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

export default router;