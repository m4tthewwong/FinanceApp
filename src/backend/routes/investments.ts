import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const router = Router();

// Get all holdings with current prices from Yahoo Finance
router.get('/holdings', async (_req: Request, res: Response) => {
  const { data: holdings, error } = await supabase
    .from('holdings')
    .select('*, accounts(name)');

  if (error) return res.status(500).json({ error: error.message });
  if (!holdings || holdings.length === 0) return res.json([]);

  const tickers = [...new Set(holdings.map((h) => h.ticker))];

  const prices: Record<string, { price: number; change: number; changePercent: number }> = {};

  for (const ticker of tickers) {
    try {
      const quote = await yahooFinance.quote(ticker) as any;
      prices[ticker] = {
        price: quote.regularMarketPrice ?? 0,
        change: quote.regularMarketChange ?? 0,
        changePercent: quote.regularMarketChangePercent ?? 0,
      };
    } catch {
      prices[ticker] = { price: 0, change: 0, changePercent: 0 };
    }
  }

  const enriched = holdings.map((h) => ({
    ...h,
    current_price: prices[h.ticker]?.price ?? 0,
    daily_change: prices[h.ticker]?.change ?? 0,
    daily_change_percent: prices[h.ticker]?.changePercent ?? 0,
    total_value: (prices[h.ticker]?.price ?? 0) * h.quantity,
  }));

  return res.json(enriched);
});

// Get investment snapshots for a given account
router.get('/snapshots/:accountId', async (req: Request, res: Response) => {
  const { accountId } = req.params;

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select('*')
    .eq('account_id', accountId)
    .order('snapshot_date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Save a daily snapshot
router.post('/snapshots', async (req: Request, res: Response) => {
  const { account_id, total_value, snapshot_date } = req.body;

  const { data, error } = await supabase
    .from('investment_snapshots')
    .upsert({
      user_id: process.env.USER_ID,
      account_id,
      total_value,
      snapshot_date,
    }, { onConflict: 'account_id,snapshot_date' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Log a transfer in or out of the investment account
router.post('/transfers', async (req: Request, res: Response) => {
  const { account_id, amount, transfer_date, note } = req.body;

  const { data, error } = await supabase
    .from('investment_transfers')
    .insert({
      user_id: process.env.USER_ID,
      account_id,
      amount,
      transfer_date,
      note,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Upsert holdings (called after Schwab sync)
router.post('/holdings', async (req: Request, res: Response) => {
  const { account_id, holdings } = req.body;

  for (const holding of holdings) {
    const { error } = await supabase
      .from('holdings')
      .upsert({
        user_id: process.env.USER_ID,
        account_id,
        ticker: holding.ticker,
        name: holding.name,
        quantity: holding.quantity,
        cost_basis: holding.cost_basis,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'account_id,ticker' });

    if (error) return res.status(500).json({ error: error.message });
  }

  return res.json({ success: true });
});

export default router;