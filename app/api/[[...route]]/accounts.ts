import { Hono } from 'hono';
import { db } from '../../../database/drizzle';
import { accounts, insertAccountSchema } from '../../../database/schema';
import { zValidator } from '@hono/zod-validator';
import { and, eq, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const app = new Hono()
  .get('/', async (context) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return context.json({ error: 'unauthorized' }, 401);

    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, session.user.id));
    return context.json({ data });
  })
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    async (context) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      const { id } = context.req.valid('param');

      if (!id) {
        return context.json({ error: 'id not found' }, 400);
      }

      if (!session) return context.json({ error: 'unauthorized' }, 401);

      const [data] = await db
        .select({
          id: accounts.id,
          name: accounts.name,
        })
        .from(accounts)
        .where(
          and(eq(accounts.userId, session.session.userId), eq(accounts.id, id))
        );

      if (!data) return context.json({ error: 'Not found' }, 404);

      return context.json({ data });
    }
  )
  .post(
    '/',
    zValidator(
      'json',
      insertAccountSchema.pick({
        name: true,
      })
    ),

    async (context) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      const values = context.req.valid('json');

      if (!session) return context.json({ error: 'unauthorized' }, 401);

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: session.session.userId,
          ...values,
        })
        .returning();

      return context.json({ data });
    }
  )
  .post(
    '/bulk-delete',
    zValidator(
      'json',
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (context) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      const values = context.req.valid('json');

      if (!session) return context.json({ error: 'unauthorized' }, 401);

      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, session.session.userId),
            inArray(accounts.id, values.ids)
          )
        )
        .returning({
          id: accounts.id,
        });

      return context.json({ data });
    }
  )
  .patch(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      'json',
      insertAccountSchema.pick({
        name: true,
      })
    ),
    async (context) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      const { id } = context.req.valid('param');
      const values = context.req.valid('json');

      if (!id) return context.json({ error: 'Missing id' }, 400);

      if (!session) return context.json({ error: 'Unauthorized' }, 401);

      const [data] = await db
        .update(accounts)
        .set(values)
        .where(
          and(eq(accounts.userId, session.session.userId), eq(accounts.id, id))
        )
        .returning();

      if (!data) return context.json({ error: 'Not found' }, 404);

      return context.json({ data });
    }
  )
  .delete(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    async (context) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      const { id } = context.req.valid('param');

      if (!id) return context.json({ error: 'Missing id' }, 400);

      if (!session) return context.json({ error: 'Unauthorized' }, 401);

      const [data] = await db
        .delete(accounts)
        .where(
          and(eq(accounts.userId, session.session.userId), eq(accounts.id, id))
        )
        .returning({
          id: accounts.id,
        });

      if (!data) return context.json({ error: 'Not found' }, 404);

      return context.json({ data });
    }
  );

export default app;
