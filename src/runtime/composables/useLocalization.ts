import useLocale from "../composables/useLocale";
import {useCookie, useState} from "nuxt/app";
import {computed, watch, type Ref} from "vue";
import type {LocaleKey, TranslationMessages} from "../types/generated-locales";

export type TranslationMap = readonly string[];
export type Locale<T extends TranslationMap> = T[number];

export type LocaleKeys<T extends TranslationMap> = T[keyof T];

export type TMultilinguistResponse<T extends TranslationMap> = {
  t: (key: LocaleKey) => string;
  setLocale: (locale: Locale<T>) => void;
  initLocalization: () => Promise<void>;
  locale: Ref<Locale<T>>;
};

export default function useLocalization<const T extends TranslationMap>(
  supportedLanguages: T,
  defaultLocale: Locale<T>,
): TMultilinguistResponse<T> {
  const userSelectedLocale = useCookie("multilinguist-locale", {default: () => defaultLocale});
  const {locale: userBrowserLocale} = useLocale(supportedLanguages, defaultLocale);

  const localeFiles: Record<string, {
    default: LocaleKeys<T>
  }> = import.meta.glob('@/public/locales/*.json', {eager: true});

  const loadedLanguages = useState<Partial<Record<Locale<T>, LocaleKeys<T>>>>("loaded-languages", () => ({}));

  const loadLocaleMessages = async (locale: Locale<T>) => {
    if (!loadedLanguages.value[locale]) {
      const fileKey = `/public/locales/${locale}.json`;
      const messages: { default: LocaleKeys<T> } = localeFiles[fileKey];
      if (messages) {
        loadedLanguages.value[locale] = messages?.default;
      } else {
        throw new Error(`Locale file ${fileKey} not found`);
      }
    }
  };

  const userPrefferableLocale = computed(() => {
    return userSelectedLocale.value ? userSelectedLocale.value : userBrowserLocale.value;
  });

  const locale = useState<Locale<T>>(() => {
    return userPrefferableLocale.value || defaultLocale;
  });

  const t = (key: LocaleKey) => {
    const localeKeys = loadedLanguages.value[locale.value] as TranslationMessages;

    return String(localeKeys?.[key] || key);
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
  };
}
