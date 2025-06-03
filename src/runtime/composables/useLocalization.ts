import useLocale from "../composables/useLocale";
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

  const loadedLanguages = useState<Partial<Record<Locale<T>, LocaleKeys<T>>>>("loaded-languages", () => ({}));

  const loadDefaultLocale = async () => {
    if (!loadedLanguages.value[defaultLocale]) {
      const messages = await import(`@/public/locales/${defaultLocale}.json`);
      loadedLanguages.value[defaultLocale] = messages.default;
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
      const loadedLocale: LocaleKeys<T> = await import(`@/public/locales/${newLocale}.json`).then(
        module => module.default || module,
      );
      loadedLanguages.value[newLocale] = loadedLocale;
    }

    userSelectedLocale.value = newLocale;
    locale.value = newLocale;
  };

  const initLocalization = async () => {
    await loadDefaultLocale();
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
