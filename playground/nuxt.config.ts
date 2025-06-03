export default defineNuxtConfig({
  modules: ['../src/module'],
  multilinguist: {
    defaultLocale: "en",
    supportedLanguages: ["en", "es"],
  },
  devtools: { enabled: true },
})
