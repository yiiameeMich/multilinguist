import { describe, it, expect, vi } from "vitest";

vi.mock("nuxt/app", () => ({ useRequestHeaders: () => ({}) }));

import { resolveLocale } from "../src/runtime/composables/useLocale";

const supported = ["en", "pt-PT", "pt-BR", "de"] as const;

describe("resolveLocale", () => {
  it("prefers an exact full-code match", () => {
    expect(resolveLocale("pt-BR", supported, "en")).toBe("pt-BR");
    expect(resolveLocale("pt-PT", supported, "en")).toBe("pt-PT");
  });

  it("matches the full code case-insensitively", () => {
    expect(resolveLocale("pt-br", supported, "en")).toBe("pt-BR");
    expect(resolveLocale("PT-PT", supported, "en")).toBe("pt-PT");
  });

  it("falls back to the base language when there is no exact match", () => {
    expect(resolveLocale("de-AT", supported, "en")).toBe("de");
    expect(resolveLocale("en-US", supported, "en")).toBe("en");
  });

  it("returns the default locale when nothing matches", () => {
    expect(resolveLocale("fr-FR", supported, "en")).toBe("en");
    expect(resolveLocale("pt", supported, "en")).toBe("en");
  });

  it("returns the default locale for empty input", () => {
    expect(resolveLocale(undefined, supported, "en")).toBe("en");
    expect(resolveLocale(null, supported, "en")).toBe("en");
    expect(resolveLocale("", supported, "en")).toBe("en");
    expect(resolveLocale("   ", supported, "en")).toBe("en");
  });
});
