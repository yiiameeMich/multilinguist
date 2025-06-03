import { defineNuxtPlugin } from "#app";
import useLocalization, { type TranslationMap, type Locale } from "../runtime/composables/useLocalization";

export default defineNuxtPlugin(async nuxtApp => {
  const config = nuxtApp.$config.public.multilinguist || {
    defaultLocale: "en",
    supportedLanguages: ["en"],
  };

  const supportedLanguages = config.supportedLanguages as TranslationMap;
  const defaultLocale = config.defaultLocale as Locale<TranslationMap>;

  const { initLocalization, ...localizationProperties } = useLocalization(supportedLanguages, defaultLocale);

  await initLocalization();

  console.log("[multilinguist] is initialised");

  nuxtApp.provide("localization", localizationProperties);
  nuxtApp.provide("t", localizationProperties.t);
  nuxtApp._localization = localizationProperties;
});
