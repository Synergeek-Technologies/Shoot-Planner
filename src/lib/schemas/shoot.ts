import { z } from 'zod';

export const shootCreateSchema = z.object({
  brand_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  scheduled_at: z.string().datetime(),
  location_notes: z.string().max(2000).optional().default(''),
});

export const shootUpdateSchema = shootCreateSchema.partial().omit({ brand_id: true });

export type ShootCreateInput = z.infer<typeof shootCreateSchema>;
export type ShootUpdateInput = z.infer<typeof shootUpdateSchema>;
