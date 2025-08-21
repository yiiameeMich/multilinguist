import useLocale from "../composables/useLocale";
import { useCookie, useState } from "nuxt/app";
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

  const userSelectedLocale = useCookie("multilinguist-locale", {
    default: () =>
      supportedLanguages.includes(userBrowserLocale.value) && setBrowserLanguage
        ? userBrowserLocale.value
        : defaultLocale,
  });

  const localeFiles: Record<
    string,
    {
      default: LocaleKeys<T>;
    }
  > = import.meta.glob("@@/public/locales/*.json", { eager: true });

  const loadedLanguages = useState<Partial<Record<Locale<T>, LocaleKeys<T>>>>("loaded-languages", () => ({}));

  const loadLocaleMessages = async (locale: Locale<T>) => {
    if (!loadedLanguages.value[locale]) {
      const fileKeyVersion4 = `../public/locales/${locale}.json`;
      const fileKeyVersion3 = `/public/locales/${locale}.json`;

      const messages: { default: LocaleKeys<T> } = localeFiles[fileKeyVersion4] || localeFiles[fileKeyVersion3];

      if (messages) {
        loadedLanguages.value[locale] = messages?.default;
      } else {
        if (!localeFiles[fileKeyVersion4]) {
          throw new Error(`Locale file ${localeFiles[fileKeyVersion4]} not found`);
        } else {
          throw new Error(`Locale file ${localeFiles[fileKeyVersion3]} not found`);
        }
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
