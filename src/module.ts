import { addPlugin, createResolver, defineNuxtModule, addImportsDir } from "@nuxt/kit";
import GenerateLocaleKeysPlugin from "./vite-generate-keys";
import { resolve } from "path";

export default defineNuxtModule({
  meta: {
    name: "@yiiamee/multilinguist",
    configKey: "multilinguist",
    version: "1.5.0",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0",
    },
    defaults: {
      logging: true,
      defaultLocale: "",
      supportedLanguages: [],
      setBrowserLanguage: true,
      localesPath: "./public/locales",
    },
  },
  setup(moduleOptions, nuxtApp) {
    const resolver = createResolver(import.meta.url);

    // Ensure localesPath has a default value and resolve it
    const localesPath = moduleOptions.localesPath || "./public/locales";
    const resolvedLocalesPath = resolve(nuxtApp.options.rootDir, localesPath);

    addPlugin(resolver.resolve("runtime/plugin"));
    addImportsDir(resolver.resolve("runtime/composables"));

    nuxtApp.options.runtimeConfig.public.multilinguist = {
      defaultLocale: moduleOptions.defaultLocale,
      supportedLanguages: moduleOptions.supportedLanguages,
      logging: typeof moduleOptions.logging === "boolean" ? moduleOptions.logging : true,
      setBrowserLanguage:
        typeof moduleOptions.setBrowserLanguage === "boolean" ? moduleOptions.setBrowserLanguage : true,
      localesPath: localesPath,
    };

    nuxtApp.hook("vite:extendConfig", viteConfig => {
      viteConfig.plugins = viteConfig.plugins || [];
      viteConfig.plugins.push(
        GenerateLocaleKeysPlugin(
          moduleOptions.defaultLocale,
          resolvedLocalesPath,
          resolver.resolve("./runtime/types/generated-locales.d.ts"),
          moduleOptions.logging,
          localesPath,
          moduleOptions.supportedLanguages,
          nuxtApp.options.rootDir, // Pass the project root
        ),
      );
    });

    nuxtApp.hook("prepare:types", ({ references }) => {
      references.push({
        path: resolver.resolve("./runtime/types/generated-locales.d.ts"),
      });
      references.push({
        path: resolver.resolve("./runtime/types/locale-imports.ts"),
      });
    });
  },
});
