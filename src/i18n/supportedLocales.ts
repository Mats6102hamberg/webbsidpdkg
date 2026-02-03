export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = [
  "sv",
  "en",
  "fr",
  "es",
  "de",
  "nl",
  "th",
  "da",
  "it",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
