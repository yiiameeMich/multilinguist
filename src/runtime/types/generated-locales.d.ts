
// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY

export interface TranslationMessages {
  "Hello, World": string;
  "Switch Locale": string;
  "Paste your variable here": string;
  "nested.Nested key": string;
  "nested.Language": string;
  "nested.nested second level.nested second level language": string;
}

export type LocaleKey = keyof TranslationMessages;

export type TFunction = <K extends LocaleKey>(
  key: K,
  variables?: Record<string, string>
) => string;

declare global {
  type LocaleKey = keyof TranslationMessages;
  type TFunction = <K extends LocaleKey>(
    key: K,
    variables?: Record<string, string>
  ) => string;
}

declare module '#app' {
  interface NuxtApp {
    $t: TFunction;
    t: TFunction;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: TFunction;
    t: TFunction;
  }
}
