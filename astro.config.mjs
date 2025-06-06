// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: netlify(),
  integrations: [react()],
  srcDir: "./src",

  vite: {
    plugins: [tailwindcss()],
  },

  server: {
    port: 3000, // Set your desired port here
  },
});
