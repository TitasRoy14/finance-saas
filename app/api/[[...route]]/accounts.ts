import { Hono } from 'hono';
import { db } from '../../../database/drizzle';
import { accounts, insertAccountSchema } from '../../../database/schema';
import { zValidator } from '@hono/zod-validator';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

const app = new Hono()
  .get('/', clerkMiddleware(), async (context) => {
    const auth = getAuth(context);
    if (!auth?.userId) {
      return context.json({ error: 'unauthorized' }, 401);
    }
    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, auth.userId));
    return context.json({ data });
  })
  .post(
    '/',
    clerkMiddleware(),
    zValidator(
      'json',
      insertAccountSchema.pick({
        name: true,
      })
    ),

    async (context) => {
      const auth = getAuth(context);

      const values = context.req.valid('json');

      if (!auth?.userId) {
        return context.json({ error: 'unauthorized' }, 401);
      }

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();

      return context.json({ data });
    }
  );

export default app;
