import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import ghPagesSpa from "@sctg/vite-plugin-github-pages-spa";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [svelte(), tailwindcss(), ghPagesSpa()],
});
