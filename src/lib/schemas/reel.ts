import { z } from 'zod';

export const REEL_STATUSES = ['planning', 'ready_to_shoot', 'shot', 'edited', 'posted'] as const;
export const reelStatusSchema = z.enum(REEL_STATUSES);

export const reelCreateSchema = z.object({
  shoot_id: z.string().uuid(),
  title: z.string().min(1).max(200),
});

export const reelUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: reelStatusSchema.optional(),
  script_text: z.string().max(20000).optional(),
  script_file_url: z.string().nullable().optional(),
  product_name: z.string().max(500).optional(),
  product_image_url: z.string().nullable().optional(),
  location_text: z.string().max(2000).optional(),
  location_image_url: z.string().nullable().optional(),
  position: z.number().int().min(0).optional(),
});

export type ReelStatus = z.infer<typeof reelStatusSchema>;
export type ReelCreateInput = z.infer<typeof reelCreateSchema>;
export type ReelUpdateInput = z.infer<typeof reelUpdateSchema>;
