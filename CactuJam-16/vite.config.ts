import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [ svelte() ],
  // Published on GitHub Pages of the Game_jams repository, which serves the committed build from `out`.
  base: `/Game_jams/CactuJam-16/out/`,
  // The production build (`npm run build`) goes here; it is committed, so do not ignore it.
  build: {
    outDir: `out`,
  },
})
