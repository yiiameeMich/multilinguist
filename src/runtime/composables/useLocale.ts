import type { Locale, TranslationMap } from "./useLocalization";
import { computed } from "vue";
import {useRequestHeaders} from "nuxt/app";

export default function useLocale<const T extends TranslationMap>(supportedLanguages: T, defaultLocale: Locale<T>) {
  const locale = computed(() => {
    if (import.meta.server) {
      const headers = useRequestHeaders(["accept-language"]);

      const locale = (headers["accept-language"]?.split(",")[0]?.split("-")[0] || defaultLocale) as Locale<T>;

      return supportedLanguages.includes(locale) ? locale : defaultLocale;
    } else if (import.meta.client) {
      const locale = (navigator.language || defaultLocale) as Locale<T>;

      return supportedLanguages.includes(locale) ? locale : defaultLocale;
    }

    return defaultLocale as Locale<T>;
  });

  return {
    locale,
  };
}
