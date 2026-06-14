import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://nwjdesigns.github.io',
  base: '/motion-quest',
  output: 'static',
  integrations: [react()],
  devToolbar: { enabled: false },
});
