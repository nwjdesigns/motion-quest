import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { experimentSchema } from './schemas/experiment';

const experiments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experiments' }),
  schema: experimentSchema,
});

export const collections = { experiments };
