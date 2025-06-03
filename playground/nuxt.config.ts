export default defineNuxtConfig({
  modules: ['../src/index'],
  multilinguist: {
    defaultLocale: "en",
    supportedLanguages: ["en", "es"],
  },
  devtools: { enabled: true },
})
