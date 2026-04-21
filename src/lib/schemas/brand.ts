import { z } from 'zod';

export const brandCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional().default(''),
  logo_url: z.string().url().nullable().optional(),
});

export const brandUpdateSchema = brandCreateSchema.partial();

export type BrandCreateInput = z.infer<typeof brandCreateSchema>;
export type BrandUpdateInput = z.infer<typeof brandUpdateSchema>;
