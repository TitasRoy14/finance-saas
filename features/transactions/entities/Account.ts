import { z } from 'zod';
import { insertAccountSchema } from '@/database/schema';

export const formSchema = insertAccountSchema.pick({
  name: true,
});

export type FormValues = z.input<typeof formSchema>;
