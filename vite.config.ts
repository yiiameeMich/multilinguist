import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/module.ts"),  // your module entry point
      name: "@yiiamee/multilinguist",
      fileName: "module",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "vue",
        "vue-demi",
        "nuxt",
        "nuxt/app",
        "@nuxt/kit",
        // add more externals your module depends on
      ],
      output: {
        exports: "named",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
