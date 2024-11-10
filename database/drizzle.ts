import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
// import '@/envConfig';

// import { config } from 'dotenv';

// config({ path: '.env.local' });

export const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
