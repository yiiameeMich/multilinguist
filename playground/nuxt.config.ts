export default defineNuxtConfig({
  modules: ["../src/module"],
  multilinguist: {
    defaultLocale: "en",
    supportedLanguages: ["en", "es"],
    logging: false,
    localesPath: "./locales",
  },
  devtools: { enabled: true },
});
