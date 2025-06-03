// eslint.config.js
// @ts-check
import {createConfigForNuxt} from '@nuxt/eslint-config/flat'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from './ .prettierrc.json'

export default createConfigForNuxt({
  features: {
    tooling: true, stylistic: true,
  }, dirs: {
    src: ['./playground'],
  },
}).append({
  files: ['**/*.ts', '**/*.js', '**/*.vue'],
  languageOptions: {
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      // This is the fix:
      module: 'esnext',
    },
    globals: {
      defineNuxtConfig: 'readonly',
      defineNuxtModule: 'readonly',
      useNuxt: 'readonly',
      useRuntimeConfig: 'readonly',
    },
  }, plugins: {
    prettier: prettierPlugin,
  }, rules: {
    'prettier/prettier': ['error', prettierConfig],
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-v-html': 'off',
    'no-console': 'off',
    'semi': 'off',
    'no-prototype-builtins': 'off',
    'camelcase': 'off',
    'no-restricted-imports': ['error', {
      patterns: ['~/*'],
    },],
  },
})
