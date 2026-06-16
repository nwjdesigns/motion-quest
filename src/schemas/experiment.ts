import * as z from 'zod/v4';

export const experimentSchema = z.object({
  title: z.string(),
  date: z.date(),
  description: z.string(),
  scene: z.string(),
  thumbnail: z.string(),
  aspectRatio: z.number().default(16 / 9),
  tools: z.array(z.string()).default([]),
  cavalryVersion: z.string().optional(),
  license: z.string().optional(),
  stripeLink: z.string().optional(),
});

export type Experiment = z.infer<typeof experimentSchema>;
