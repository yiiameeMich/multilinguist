import { addPlugin, createResolver, defineNuxtModule, addImportsDir } from "@nuxt/kit";
import GenerateLocaleKeysPlugin from "./vite-generate-keys";

export default defineNuxtModule({
  meta: {
    name: "@yiiamee/multilinguist",
    configKey: "multilinguist",
    version: "1.2.8",
    compatibility: {
      nuxt: "^3.0.0",
    },
  },
  setup(moduleOptions, nuxtApp) {
    const resolver = createResolver(import.meta.url);

    addPlugin(resolver.resolve("runtime/plugin"));
    addImportsDir(resolver.resolve("runtime/composables"));

    nuxtApp.hook("vite:extendConfig", viteConfig => {
      viteConfig.plugins = viteConfig.plugins || [];
      viteConfig.plugins.push(
        GenerateLocaleKeysPlugin(
          moduleOptions.defaultLocale,
          `${nuxtApp.options.rootDir}/public/locales`,
          resolver.resolve("./runtime/types/generated-locales.d.ts"),
        ),
      );
    });

    nuxtApp.hook("prepare:types", ({ references }) => {
      references.push({
        path: resolver.resolve("./runtime/types/generated-locales.d.ts"),
      });
    });

    nuxtApp.options.runtimeConfig.public.multilinguist = {
      defaultLocale: moduleOptions.defaultLocale,
      supportedLanguages: moduleOptions.supportedLanguages,
    };
  },
});
