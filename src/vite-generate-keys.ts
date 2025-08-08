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

const generateLocaleImports = (
  absoluteLocalesPath: string,
  relativeLocalesPath: string,
  supportedLanguages: string[],
  generatedFilePath: string,
  projectRoot: string,
) => {
  // Calculate the relative path from the generated file to the project root
  const generatedFileDir = path.dirname(generatedFilePath);
  const relativeTo = path.relative(generatedFileDir, projectRoot);

  // Clean up the relative locales path
  const cleanLocalesPath = relativeLocalesPath.startsWith("./")
    ? relativeLocalesPath.slice(2)
    : relativeLocalesPath.startsWith("/")
      ? relativeLocalesPath.slice(1)
      : relativeLocalesPath;

  // Combine the relative path to root with the locales path
  const importBasePath = path.join(relativeTo, cleanLocalesPath).replace(/\\/g, "/");

  // For the file keys, use the original relative path format
  const normalizedKeyPath = relativeLocalesPath.startsWith("./")
    ? relativeLocalesPath.slice(1)
    : relativeLocalesPath.startsWith("/")
      ? relativeLocalesPath
      : `/${relativeLocalesPath}`;

  const imports = supportedLanguages
    .map((lang, index) => `import locale_${index} from "${importBasePath}/${lang}.json";`)
    .join("\n");

  const localeMap = supportedLanguages
    .map((lang, index) => `  "${normalizedKeyPath}/${lang}.json": { default: locale_${index} }`)
    .join(",\n");

  return `
// AUTO-GENERATED LOCALE IMPORTS
${imports}

export const localeFiles = {
${localeMap}
};
`;
};

export default function GenerateLocaleKeysPlugin(
  defaultLocaleFromConfig: string,
  absoluteLocalesPath: string,
  outPath: string,
  logging: boolean = true,
  relativeLocalesPath: string = "./public/locales",
  supportedLanguages: string[] = [],
  projectRoot: string = process.cwd(),
): Plugin {
  async function generateTypes() {
    const defaultLocalePath = path.join(absoluteLocalesPath, `${defaultLocaleFromConfig}.json`);

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

  async function generateLocaleImportsFile() {
    const importsPath = path.dirname(outPath) + "/locale-imports.ts";
    const imports = generateLocaleImports(
      absoluteLocalesPath,
      relativeLocalesPath,
      supportedLanguages,
      importsPath,
      projectRoot,
    );

    fs.mkdirSync(path.dirname(importsPath), { recursive: true });
    fs.writeFileSync(importsPath, imports, "utf-8");

    if (logging) {
      console?.warn(`✅ Generated locale imports to ${importsPath}`);
      const generatedFileDir = path.dirname(importsPath);
      const relativeTo = path.relative(generatedFileDir, projectRoot);
      const cleanLocalesPath = relativeLocalesPath.startsWith("./")
        ? relativeLocalesPath.slice(2)
        : relativeLocalesPath.startsWith("/")
          ? relativeLocalesPath.slice(1)
          : relativeLocalesPath;
      const finalPath = path.join(relativeTo, cleanLocalesPath).replace(/\\/g, "/");
      console?.warn(`✅ Import path calculated: ${finalPath}`);
    }
  }

  return {
    name: "vite-plugin-generate-locales-types",

    async buildStart() {
      await generateTypes();
      if (supportedLanguages.length > 0) {
        await generateLocaleImportsFile();
      }
    },

    async handleHotUpdate(ctx) {
      if (ctx.file.endsWith(".json") && ctx.file.includes(absoluteLocalesPath)) {
        await generateTypes();
        if (supportedLanguages.length > 0) {
          await generateLocaleImportsFile();
        }
      }
    },
  };
}
