import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

function flattenKeys(obj: Record<string, any>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      return flattenKeys(value, fullKey);
    }
    return [fullKey];
  });
}

const generateOutputString = (func: Function) => {
  return `
// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY

export interface TranslationMessages {
${func()}
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
`;
};

export default function GenerateLocaleKeysPlugin(
  defaultLocaleFromConfig: string,
  localesPath: string,
  outPath: string,
  logging: boolean = true,
): Plugin {
  async function generateTypes() {
    const defaultLocalePath = path.join(localesPath, `${defaultLocaleFromConfig}.json`);

    if (!fs.existsSync(defaultLocalePath)) {
      console?.error(`❌ Default locale file not found: ${defaultLocalePath}`);
      return;
    }

    const json = JSON.parse(fs.readFileSync(defaultLocalePath, "utf-8"));
    const keys = flattenKeys(json);

    const output = generateOutputString(() => keys.map(key => `  ${JSON.stringify(key)}: string;`).join("\n"));

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, "utf-8");

    if (logging) {
      console?.warn(`✅ Generated types to ${outPath} from ${defaultLocalePath}`);
    }
  }

  return {
    name: "vite-plugin-generate-locales-types",

    async buildStart() {
      await generateTypes();
    },

    async handleHotUpdate(ctx) {
      if (ctx.file.endsWith(".json") && ctx.file.includes(localesPath)) {
        await generateTypes();
      }
    },
  };
}
