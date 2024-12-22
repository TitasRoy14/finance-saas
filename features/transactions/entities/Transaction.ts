import { z } from 'zod';
import { insertTransactionSchema } from '@/database/schema';

export const formSchema = insertTransactionSchema.omit({
  id: true,
});
const apiSchema = insertTransactionSchema.omit({
  id: true,
});

export type FormValues = z.input<typeof formSchema>;

export type ApiFormValues = z.input<typeof apiSchema>;
