import { db } from '@/database/drizzle';
import { and, eq, isNotNull } from 'drizzle-orm';
import {
  accounts,
  categories,
  connectedBanks,
  transactions,
} from '@/database/schema';
import { convertAmountToMilliunits } from '@/lib/utils';
import { zValidator } from '@hono/zod-validator';
import { createId } from '@paralleldrive/cuid2';
import { Hono } from 'hono';
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from 'plaid';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      PLAID_CLIENT_ID: process.env.PLAID_CLIENT_TOKEN,
      PLAID_SECRET: process.env.PLAID_SECRET_TOKEN,
    },
  },
});

const client = new PlaidApi(configuration);

const app = new Hono()
  .get('/connected-bank', async (context) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return context.json({ error: 'Unauthorized' }, 401);
    }

    const [connectedBank] = await db
      .select()
      .from(connectedBanks)
      .where(eq(connectedBanks.userId, session.session.userId));

    return context.json({ data: connectedBank || null });
  })
  .delete('/connected-bank', async (context) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return context.json({ error: 'Unauthorized' }, 401);
    }

    const [connectedBank] = await db
      .delete(connectedBanks)
      .where(eq(connectedBanks.userId, session.session.userId))
      .returning({ id: connectedBanks.id });

    if (!connectedBank) return context.json({ error: 'Not found' }, 404);

    await db
      .delete(accounts)
      .where(
        and(
          eq(accounts.userId, session.session.userId),
          isNotNull(accounts.plaidId)
        )
      );

    await db
      .delete(categories)
      .where(
        and(
          eq(categories.userId, session.session.userId),
          isNotNull(categories.plaidId)
        )
      );

    return context.json({ data: connectedBank || null });
  })
  .post('/create-link-token', async (context) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return context.json({ error: 'Unauthorized' }, 401);
    }

    const token = await client.linkTokenCreate({
      client_id: process.env.PLAID_CLIENT_TOKEN,
      secret: process.env.PLAID_SECRET_TOKEN,
      user: {
        client_user_id: session.session.userId,
      },
      client_name: 'expensio',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return context.json({ data: token.data.link_token }, 200);
  })
  .post(
    '/exchange-public-token',
    zValidator(
      'json',
      z.object({
        publicToken: z.string(),
      })
    ),
    async (context) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      const { publicToken } = context.req.valid('json');

      if (!session) {
        return context.json({ error: 'Unauthorized' }, 401);
      }

      const exchange = await client.itemPublicTokenExchange({
        client_id: process.env.PLAID_CLIENT_TOKEN,
        secret: process.env.PLAID_SECRET_TOKEN,
        public_token: publicToken,
      });

      const [connectedBank] = await db
        .insert(connectedBanks)
        .values({
          id: createId(),
          userId: session.session.userId,
          accessToken: exchange.data.access_token,
        })
        .returning();

      const plaidTransactions = await client.transactionsSync({
        client_id: process.env.PLAID_CLIENT_TOKEN,
        secret: process.env.PLAID_SECRET_TOKEN,
        access_token: connectedBank.accessToken,
      });

      const plaidAccounts = await client.accountsGet({
        client_id: process.env.PLAID_CLIENT_TOKEN,
        secret: process.env.PLAID_SECRET_TOKEN,
        access_token: connectedBank.accessToken,
      });

      const plaidCategories = await client.categoriesGet({});

      const newAccounts = await db
        .insert(accounts)
        .values(
          plaidAccounts.data.accounts.map((account) => ({
            id: createId(),
            name: account.name,
            plaidId: account.account_id,
            userId: session.session.userId,
          }))
        )
        .returning();

      const newCategory = await db
        .insert(categories)
        .values(
          plaidCategories.data.categories.map((category) => ({
            id: createId(),
            name: category.hierarchy.join(', '),
            plaidId: category.category_id,
            userId: session.session.userId,
          }))
        )
        .returning();

      const newTransactionsValues = plaidTransactions.data.added.reduce(
        (acc, transaction) => {
          const account = newAccounts.find(
            (account) => account.plaidId === transaction.account_id
          );
          const category = newCategory.find(
            (category) => category.plaidId === transaction.category_id
          );

          const amountInMilliunits = convertAmountToMilliunits(
            transaction.amount
          );

          if (account) {
            acc.push({
              id: createId(),
              amount: amountInMilliunits,
              payee: transaction.merchant_name || transaction.name,
              notes: transaction.name,
              date: new Date(transaction.date),
              accountId: account.id,
              categoryId: category?.id,
            });
          }

          return acc;
        },
        [] as (typeof transactions.$inferInsert)[]
      );

      if (newTransactionsValues.length > 0) {
        await db.insert(transactions).values(newTransactionsValues);
      }

      return context.json({ ok: true }, 200);
    }
  );

export default app;

// Account filtering isn't required here, but sometimes
// it's helpful to see an example.
