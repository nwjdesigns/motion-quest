import * as z from 'zod/v4';

export const experimentSchema = z.object({
  title: z.string(),
  date: z.date(),
  description: z.string(),
  scene: z.string(),
  thumbnail: z.string(),
  stripeLink: z.string().optional(),
});

export type Experiment = z.infer<typeof experimentSchema>;
