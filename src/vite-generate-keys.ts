import fs from "fs";
import path from "path";
import type {Plugin} from "vite";

export default function GenerateLocaleKeysPlugin(defaultLocaleFromConfig: string, localesPath: string, outPath: string): Plugin {
  async function generateTypes() {
    const defaultLocalePath = path.join(localesPath, `${defaultLocaleFromConfig}.json`);

    if (!fs.existsSync(defaultLocalePath)) {
      console?.error(`Default locale file not found: ${defaultLocalePath}`);
      return;
    }

    const json = JSON.parse(fs.readFileSync(defaultLocalePath, "utf-8"));
    const keys = Object.keys(json);

    const output = [
      `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY`,
      `export interface TranslationMessages {`,
      ...keys.map(key => `  ${JSON.stringify(key)}: string;`),
      `}`,
      ``,
      `export type LocaleKey = keyof TranslationMessages;`,
    ].join("\n");

    fs.mkdirSync(path.dirname(outPath), {recursive: true});
    fs.writeFileSync(outPath, output, "utf-8");

    console?.warn(`Generated types/generated-locales.d.ts from ${defaultLocalePath}`);
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
