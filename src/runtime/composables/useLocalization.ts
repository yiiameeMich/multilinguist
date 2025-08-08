import useLocale from "../composables/useLocale";
import { useCookie, useState, useRuntimeConfig } from "nuxt/app";
import { computed, watch, type Ref, type ComputedRef } from "vue";
import type { LocaleKey, TranslationMessages } from "../types/generated-locales";

export type TranslationMap = readonly string[];
export type Locale<T extends TranslationMap> = T[number];

export type LocaleKeys<T extends TranslationMap> = T[keyof T];

export type TMultilinguistResponse<T extends TranslationMap> = {
  t<K extends LocaleKey>(key: K, variables?: Record<string, string>): string;
  setLocale: (locale: Locale<T>) => void;
  initLocalization: () => Promise<void>;
  locale: Ref<Locale<T>>;
  locales: ComputedRef<T>;
};

export default function useLocalization<const T extends TranslationMap>(
  supportedLanguages: T,
  defaultLocale: Locale<T>,
  setBrowserLanguage: boolean = true,
): TMultilinguistResponse<T> {
  const { locale: userBrowserLocale } = useLocale(supportedLanguages, defaultLocale);
  const config = useRuntimeConfig();

  const userSelectedLocale = useCookie("multilinguist-locale", {
    default: () =>
      supportedLanguages.includes(userBrowserLocale.value) && setBrowserLanguage
        ? userBrowserLocale.value
        : defaultLocale,
  });

  const loadedLanguages = useState<Partial<Record<Locale<T>, LocaleKeys<T>>>>("loaded-languages", () => ({}));

  const loadLocaleMessages = async (locale: Locale<T>) => {
    if (!loadedLanguages.value[locale]) {
      try {
        // Get the configured locales path
        const localesPath = config.public.multilinguist.localesPath || "./public/locales";
        const normalizedPath = localesPath.startsWith("./")
          ? localesPath.slice(2) // Remove "./"
          : localesPath.startsWith("/")
            ? localesPath.slice(1) // Remove leading "/"
            : localesPath;

        let messages: any;

        if (import.meta.server) {
          // On server side, read from file system using the resolved path
          const { readFileSync, existsSync } = await import("fs");
          const { join } = await import("path");

          const resolvedPath = config.multilinguist?.resolvedLocalesPath;
          const filePath = join(resolvedPath, `${locale}.json`);

          if (!existsSync(filePath)) {
            throw new Error(`Locale file not found: ${filePath}`);
          }

          const fileContent = readFileSync(filePath, "utf-8");
          messages = JSON.parse(fileContent);
        } else {
          // On client side, fetch from public directory
          const url = `/${normalizedPath}/${locale}.json`;
          const response = await $fetch(url);
          messages = response;
        }

        loadedLanguages.value[locale] = messages;
      } catch (error) {
        console.error(`Failed to load locale '${locale}':`, error);
        throw new Error(`Locale file for '${locale}' not found at configured path`);
      }
    }
  };

  const userPrefferableLocale = computed(() => {
    return userSelectedLocale.value ? userSelectedLocale.value : userBrowserLocale.value;
  });

  const locale = useState<Locale<T>>(() => {
    return userPrefferableLocale.value || defaultLocale;
  });

  const t = <const K extends LocaleKey>(key: K, variables?: Record<string, string>): string => {
    const messages = loadedLanguages.value[locale.value] as TranslationMessages;

    let translatedText = messages?.[key] ?? key;

    if (key.includes(".") && !messages?.[key]) {
      const nestedKeyArray = key.split(".") as LocaleKey[];
      translatedText = nestedKeyArray.reduce((acc, key) => acc?.[key], messages);
    }

    if (variables && typeof translatedText === "string") {
      translatedText = translatedText.replace(/{([^}]+)}/g, (_, varKey) => {
        return variables[varKey] ?? `{${varKey}}`;
      });
    }

    return String(translatedText);
  };

  const setLocale = async (newLocale: Locale<T>) => {
    if (!loadedLanguages.value[newLocale] && supportedLanguages.includes(newLocale)) {
      await loadLocaleMessages(newLocale);
    }

    userSelectedLocale.value = newLocale;
    locale.value = newLocale;
  };

  const initLocalization = async () => {
    await loadLocaleMessages(defaultLocale);
    await setLocale(userPrefferableLocale.value);
  };

  const locales = computed(() => {
    return supportedLanguages;
  });

  watch(
    () => locale.value,
    async val => {
      if (val !== userSelectedLocale.value) {
        userSelectedLocale.value = val;
      }
    },
  );

  return {
    t,
    setLocale,
    initLocalization,
    locale,
    locales,
  };
}
