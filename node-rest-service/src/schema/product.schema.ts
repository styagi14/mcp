import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3, 'Name must be atleast 3 characters long'),
  category: z.string().min(3)
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
