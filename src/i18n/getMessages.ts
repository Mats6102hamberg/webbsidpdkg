import { DEFAULT_LOCALE, isSupportedLocale } from "./supportedLocales";

export type Messages = Record<string, unknown>;

async function loadMessages(locale: string): Promise<Messages> {
  const module = await import(`./messages/${locale}.json`);
  return module.default as Messages;
}

export async function getMessages(locale: string): Promise<Messages> {
  const target = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;

  try {
    return await loadMessages(target);
  } catch {
    return await loadMessages(DEFAULT_LOCALE);
  }
}
