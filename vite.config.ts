import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

function copy404Plugin(): Plugin {
  let config: ResolvedConfig;
  return {
    name: "copy-404",
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      const outDir = config.build.outDir;
      copyFileSync(resolve(outDir, "index.html"), resolve(outDir, "404.html"));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [svelte(), tailwindcss(), copy404Plugin()],
});
