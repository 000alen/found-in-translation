/** BCP-47 language codes supported by the reading studio. */
export type LanguageCode = "en" | "es" | "de" | "uk";

export type LanguageMeta = {
  code: LanguageCode;
  /** English name for UI chrome */
  name: string;
  /** Native endonym */
  nativeName: string;
  /** ISO 639-1 / BCP-47 for `lang` attributes */
  bcp47: string;
  script: "latin" | "cyrillic";
  direction: "ltr";
};

export const LANGUAGES: Record<LanguageCode, LanguageMeta> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    bcp47: "en",
    script: "latin",
    direction: "ltr",
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    bcp47: "es",
    script: "latin",
    direction: "ltr",
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    bcp47: "de",
    script: "latin",
    direction: "ltr",
  },
  uk: {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    bcp47: "uk",
    script: "cyrillic",
    direction: "ltr",
  },
};

export function isLanguageCode(value: string): value is LanguageCode {
  return value in LANGUAGES;
}

export function getLanguage(code: string): LanguageMeta {
  if (isLanguageCode(code)) return LANGUAGES[code];
  return {
    code: "en",
    name: code.toUpperCase(),
    nativeName: code.toUpperCase(),
    bcp47: code,
    script: "latin",
    direction: "ltr",
  };
}

/** Short label for column headers, e.g. "Українська" or "Deutsch" */
export function formatLanguageLabel(code: string): string {
  return getLanguage(code).nativeName;
}

/** Edition pair label, e.g. "Українська → English" */
export function formatLanguagePair(source: string, target: string): string {
  return `${formatLanguageLabel(source)} → ${formatLanguageLabel(target)}`;
}

/** CSS class hook for script-specific typography */
export function scriptClassFor(code: string): string {
  const script = getLanguage(code).script;
  return script === "cyrillic" ? "text-cyrillic" : "text-latin";
}
