import useLocalization, { type TranslationMap, type Locale } from "../runtime/composables/useLocalization";

export default defineNuxtPlugin(async nuxtApp => {
  const config = useRuntimeConfig().public.multilinguist || {
    defaultLocale: "en",
    supportedLanguages: ["en"],
  };

  const supportedLanguages = config.supportedLanguages as TranslationMap;
  const defaultLocale = config.defaultLocale as Locale<TranslationMap>;

  const localization = useLocalization(supportedLanguages, defaultLocale);

  await localization.initLocalization();

  console.log("[multilinguist] is initialised", config.supportedLanguages, config.defaultLocale);
  nuxtApp.provide("localization", localization);
  nuxtApp.provide("t", localization.t);
  nuxtApp._localization = localization;
});
