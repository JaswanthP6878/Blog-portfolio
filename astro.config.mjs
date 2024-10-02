import { defineConfig } from 'astro/config';

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: 'https://jaswanthp6878.github.io',
  integrations: [mdx()]
});