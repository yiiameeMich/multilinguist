// eslint.config.js
// @ts-check
import { createConfigForNuxt } from "@nuxt/eslint-config/flat";
import prettierPlugin from "eslint-plugin-prettier";

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: ["./playground"],
  },
}).append({
  files: ["**/*.ts", "**/*.js", "**/*.vue"],
  languageOptions: {
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
      parser: require.resolve("@typescript-eslint/parser"),
      ecmaVersion: 2022,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
      // This is the fix:
      module: "esnext",
    },
    globals: {
      defineNuxtConfig: "readonly",
      defineNuxtModule: "readonly",
      useNuxt: "readonly",
      useRuntimeConfig: "readonly",
    },
  },
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
    "vue/multi-word-component-names": "off",
    semi: 0,
    "vue/no-multiple-template-root": "off",
    "no-prototype-builtins": "off",
    camelcase: "off",
    "vue/no-v-html": "off",
    "no-console": "off",
    "no-restricted-imports": [
      "error",
      {
        patterns: ["~/*"],
      },
    ],
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  extends: ["plugin:prettier/recommended", "prettier"],
});
