import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_ENV === 'production'
        ? process.env.PLAID_SECRET_PRODUCTION!
        : process.env.PLAID_SECRET_SANDBOX!,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);