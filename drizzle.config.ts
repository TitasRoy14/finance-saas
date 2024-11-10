// import { config } from 'dotenv';
// import './envConfig';
import { defineConfig } from 'drizzle-kit';

// config({ path: '.env.local' });

export default defineConfig({
  schema: './database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
