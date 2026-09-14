import type { Locale, TranslationMap } from "./useLocalization";
import { computed } from "vue";
import { useRequestHeaders } from "nuxt/app";

/**
 * Resolves a browser locale code (e.g. "pt-BR", "en-US", "de") against the list of supported locales.
 *
 * 1. Exact match on the full code (case-insensitive): "pt-BR" -> "pt-BR"
 * 2. Fallback to the base language part before the "-": "pt-BR" -> "pt"
 * 3. Otherwise the default locale.
 */
export function resolveLocale<const T extends TranslationMap>(
  candidate: string | undefined | null,
  supportedLanguages: T,
  defaultLocale: Locale<T>,
): Locale<T> {
  const normalized = candidate?.trim().toLowerCase();

  if (!normalized) {
    return defaultLocale;
  }

  const exact = supportedLanguages.find((supported) => supported.toLowerCase() === normalized);

  if (exact) {
    return exact as Locale<T>;
  }

  const base = normalized.split("-")[0];
  const partial = supportedLanguages.find((supported) => supported.toLowerCase() === base);

  return (partial ?? defaultLocale) as Locale<T>;
}

export default function useLocale<const T extends TranslationMap>(supportedLanguages: T, defaultLocale: Locale<T>) {
  const locale = computed(() => {
    if (import.meta.server) {
      const headers = useRequestHeaders(["accept-language"]);

      // "pt-BR,pt;q=0.9,en;q=0.8" -> "pt-BR"
      const browserLocale = headers["accept-language"]?.split(",")[0]?.split(";")[0];

      return resolveLocale(browserLocale, supportedLanguages, defaultLocale);
    } else if (import.meta.client) {
      return resolveLocale(navigator.language, supportedLanguages, defaultLocale);
    }

    return defaultLocale as Locale<T>;
  });

  return {
    locale,
  };
}
