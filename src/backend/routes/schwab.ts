import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

// Seed mock Schwab holdings while API approval is pending
router.post('/seed-mock', async (_req: Request, res: Response) => {
  const { data: accounts, error: accountError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', process.env.USER_ID)
    .eq('type', 'investment')
    .limit(1);

  const account = accounts?.[0];

  if (accountError || !account) {
    return res
      .status(404)
      .json({
        error: 'No investment account found. Connect one via Plaid first.',
      });
  }

  const mockHoldings = [
    { ticker: 'AAPL', name: 'Apple Inc.', quantity: 10, cost_basis: 150.0 },
    { ticker: 'MSFT', name: 'Microsoft Corp.', quantity: 5, cost_basis: 280.0 },
    {
      ticker: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      quantity: 8,
      cost_basis: 380.0,
    },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', quantity: 3, cost_basis: 400.0 },
    {
      ticker: 'BRK-B',
      name: 'Berkshire Hathaway B',
      quantity: 12,
      cost_basis: 320.0,
    },
  ];

  for (const holding of mockHoldings) {
    await supabase.from('holdings').upsert(
      {
        user_id: process.env.USER_ID,
        account_id: account.id,
        ticker: holding.ticker,
        name: holding.name,
        quantity: holding.quantity,
        cost_basis: holding.cost_basis,
        last_updated: new Date().toISOString(),
      },
      { onConflict: 'account_id,ticker' },
    );
  }

  return res.json({ success: true });
});

export default router;
