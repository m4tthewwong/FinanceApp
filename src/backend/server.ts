import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountsRouter from './routes/accounts';
import transactionsRouter from './routes/transactions';
import investmentsRouter from './routes/investments';
import budgetRouter from './routes/budget';
import plaidRouter from './routes/plaid';
import schwabRouter from './routes/schwab';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/accounts', accountsRouter);
app.use('/transactions', transactionsRouter);
app.use('/investments', investmentsRouter);
app.use('/budget', budgetRouter);
app.use('/plaid', plaidRouter);
app.use('/schwab', schwabRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;