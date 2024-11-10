import { Hono } from 'hono';
import { db } from '../../../database/drizzle';
import { accounts } from '../../../database/schema';
import { HTTPException } from 'hono/http-exception';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { eq } from 'drizzle-orm';

const app = new Hono().get('/', clerkMiddleware(), async (context) => {
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
});

export default app;
