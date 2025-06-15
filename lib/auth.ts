import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/database'; // your drizzle instance
import * as schema from '@/database/schema';
import { passkey } from 'better-auth/plugins/passkey';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg', // or "mysql", "sqlite"
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    passkey({
      // rpID: 'expensio-xi.vercel.app', // or your domain
      // rpName: 'Expensio',
      // origin: 'https://expensio-xi.vercel.app/', // or your origin
    }),
  ],
});
