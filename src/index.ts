import {addPlugin, createResolver, defineNuxtModule, addImportsDir, addTypeTemplate} from "@nuxt/kit";
import GenerateLocaleKeysPlugin from "./vite-generate-keys";

export default defineNuxtModule({
  meta: {
    name: "multilinguist",
    configKey: "multilinguist",
    version: "0.0.1",
  },
  setup(moduleOptions, nuxtApp) {
    const resolver = createResolver(import.meta.url);

    addPlugin(resolver.resolve("./runtime/plugin"));
    addImportsDir(resolver.resolve("runtime/composables"));

    addTypeTemplate({
      filename: 'types/multilinguist.d.ts',
      getContents: () => `
        import type { TranslationMessages } from './generated-locales'

        declare module '#app' {
          interface NuxtApp {
            $t: (key: keyof TranslationMessages) => string
          }
        }

        declare module 'vue' {
          interface ComponentCustomProperties {
            $t: (key: keyof TranslationMessages) => string
          }
        }
      `,
    });

    nuxtApp.hook("vite:extendConfig", viteConfig => {
      viteConfig.plugins = viteConfig.plugins || [];
      viteConfig.plugins.push(GenerateLocaleKeysPlugin(moduleOptions.defaultLocale, `${nuxtApp.options.rootDir}/public/locales`, resolver.resolve('./runtime/types/generated-locales.d.ts')));
    });

    nuxtApp.hook("prepare:types", ({references}) => {
      references.push({
        path: resolver.resolve("./runtime/types/generated-locales.d.ts"),
      });
      references.push({
        path: resolver.resolve("./runtime/types/multilinguist.d.ts"),
      });
    });

    nuxtApp.options.runtimeConfig.public.multilinguist = {
      defaultLocale: moduleOptions.defaultLocale,
      supportedLanguages: moduleOptions.supportedLanguages,
    };
  },
});
