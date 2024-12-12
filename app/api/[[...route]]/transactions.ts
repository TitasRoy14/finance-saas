import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { createId } from '@paralleldrive/cuid2';
import { parse, subDays } from 'date-fns';
import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../../database/drizzle';
import {
  accounts,
  categories,
  insertTransactionSchema,
  transactions,
} from '../../../database/schema';

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (context) => {
      const auth = getAuth(context);
      const { from, to, accountId } = context.req.valid('query');

      if (!auth?.userId) return context.json({ error: 'unauthorized' }, 401);

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, 'yyyy-MM-dd', new Date())
        : defaultFrom;
      const endDate = to ? parse(to, 'yyyy-MM-dd', new Date()) : defaultTo;

      const [data] = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          account: accounts.name,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .orderBy(desc(transactions.date));

      return context.json({ data });
    }
  )
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (context) => {
      const auth = getAuth(context);
      const { id } = context.req.valid('param');

      if (!id) {
        return context.json({ error: 'id not found' }, 400);
      }

      if (!auth?.userId)
        return context.json({ error: 'Unauthorized access' }, 401);

      const [data] = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          account: accounts.name,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(transactions.id, auth.userId), eq(accounts.userId, id)));

      if (!data) return context.json({ error: 'Not found' }, 404);

      return context.json({ data });
    }
  )
  .post(
    '/',
    clerkMiddleware(),
    zValidator(
      'json',
      insertTransactionSchema.omit({
        id: true,
      })
    ),

    async (context) => {
      const auth = getAuth(context);

      const values = context.req.valid('json');

      if (!auth?.userId) {
        return context.json({ error: 'unauthorized' }, 401);
      }

      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      return context.json({ data });
    }
  )
  .post(
    '/bulk-create',
    clerkMiddleware(),
    zValidator(
      'json',
      z.array(
        insertTransactionSchema.omit({
          id: true,
        })
      )
    ),
    async (context) => {
      const auth = getAuth(context);
      const values = context.req.valid('json');

      if (!auth?.userId) {
        return context.json({ error: 'Unauthorized' }, 401);
      }

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value,
          }))
        )
        .returning();

      return context.json({ data });
    }
  )
  .post(
    '/bulk-delete',
    clerkMiddleware(),
    zValidator(
      'json',
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (context) => {
      const auth = getAuth(context);
      const values = context.req.valid('json');

      if (!auth?.userId) {
        return context.json({ error: 'Unauthorized' }, 401);
      }

      const transactionsToBulkDelete = db.$with('transactions_to_delete').as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              inArray(transactions.id, values.ids),
              eq(accounts.userId, auth.userId)
            )
          )
      );

      const data = await db
        .with(transactionsToBulkDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToBulkDelete})`
          )
        )
        .returning({
          id: transactions.id,
        });

      return context.json({ data });
    }
  )
  .patch(
    '/:id',
    clerkMiddleware(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      'json',
      insertTransactionSchema.omit({
        id: true,
      })
    ),
    async (context) => {
      const auth = getAuth(context);
      const { id } = context.req.valid('param');
      const values = context.req.valid('json');

      if (!id) return context.json({ error: 'Missing id' }, 400);

      if (!auth?.userId) return context.json({ error: 'Unauthorized' }, 401);

      const transactionsToUpdate = db.$with('transactions_to_update').as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
      );

      const [data] = await db
        .with(transactionsToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(transactions.id, sql`select id from ${transactionsToUpdate}`)
        )
        .returning();

      if (!data) return context.json({ error: 'Not found' }, 404);

      return context.json({ data });
    }
  )
  .delete(
    '/:id',
    clerkMiddleware(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    async (context) => {
      const auth = getAuth(context);
      const { id } = context.req.valid('param');

      if (!id) return context.json({ error: 'Missing id' }, 400);

      if (!auth?.userId) return context.json({ error: 'Unauthorized' }, 401);

      const transactionsToDelete = db.$with('transactions_to_update').as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
      );

      const [data] = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(transactions.id, sql`select id from ${transactionsToDelete}`)
        )
        .returning({
          id: transactions.id,
        });

      if (!data) return context.json({ error: 'Not found' }, 404);

      return context.json({ data });
    }
  );

export default app;
