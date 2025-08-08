import { addPlugin, createResolver, defineNuxtModule, addImportsDir } from "@nuxt/kit";
import GenerateLocaleKeysPlugin from "./vite-generate-keys";
import { resolve } from "path";

export default defineNuxtModule({
  meta: {
    name: "@yiiamee/multilinguist",
    configKey: "multilinguist",
    version: "1.5.1",
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

    // Pass the resolved path to runtime config for server-side access
    nuxtApp.options.runtimeConfig.multilinguist = {
      resolvedLocalesPath: resolvedLocalesPath,
    };

    nuxtApp.hook("vite:extendConfig", viteConfig => {
      viteConfig.plugins = viteConfig.plugins || [];
      viteConfig.plugins.push(
        GenerateLocaleKeysPlugin(
          moduleOptions.defaultLocale,
          resolvedLocalesPath,
          resolver.resolve("./runtime/types/generated-locales.d.ts"),
          moduleOptions.logging,
        ),
      );
    });

    nuxtApp.hook("prepare:types", ({ references }) => {
      references.push({
        path: resolver.resolve("./runtime/types/generated-locales.d.ts"),
      });
    });

    // Ensure locale files are copied to public directory if they're not already there
    if (!localesPath.includes("public")) {
      // Add a Nitro plugin to serve locale files
      nuxtApp.hook("nitro:config", async nitroConfig => {
        nitroConfig.publicAssets = nitroConfig.publicAssets || [];
        nitroConfig.publicAssets.push({
          dir: resolvedLocalesPath,
          maxAge: 60 * 60 * 24 * 7, // 1 week
          baseURL: `/${localesPath.replace(/^\.\//, "").replace(/^public\//, "")}`,
        });
      });
    }
  },
});
