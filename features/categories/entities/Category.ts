import { z } from 'zod';
import { insertCategoriesSchema } from '@/database/schema';

export const formSchema = insertCategoriesSchema.pick({
  name: true,
});

export type FormValues = z.input<typeof formSchema>;
