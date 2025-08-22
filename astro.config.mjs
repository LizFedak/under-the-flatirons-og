// // @ts-check

// import mdx from '@astrojs/mdx';
// import sitemap from '@astrojs/sitemap';
// import { defineConfig } from 'astro/config';

// import react from '@astrojs/react';

// // import vercel from '@astrojs/vercel';
// import vercel from "@astrojs/vercel/server";
// import tailwindcss from '@tailwindcss/vite';

// // https://astro.build/config
// export default defineConfig({
//   site: 'https://example.com',
//   integrations: [mdx(), sitemap(), react()],
//   adapter: vercel(),

//   vite: {
//     plugins: [tailwindcss()],
//   },
// });
// astro.config.mjs
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless"; // ✅ use serverless (or "/edge")
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap(), react()],
  output: "server",              // needed for API routes
  adapter: vercel(),             // Vercel SSR via serverless functions
  vite: { plugins: [tailwindcss()] },
});
