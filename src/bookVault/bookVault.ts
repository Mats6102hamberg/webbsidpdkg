import { readFile } from "fs/promises";
import path from "path";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../i18n/supportedLocales";

export type BookFormat = "standard" | "a5";

export type BookMeta = {
  slug: string;
  locale: string;
  format: BookFormat;
  title: string;
  subtitle?: string;
  description?: string;
  edition?: string;
  assets?: {
    cover?: string;
    ebook?: string;
    interactive?: string;
    print?: string;
  };
  variants?: Array<{ type: string; priceHint?: string }>;
};

const DEFAULT_MODE = "local" as const;

type BookVaultMode = "local" | "remote";

function getMode(): BookVaultMode {
  const raw = process.env.BOOK_VAULT_MODE ?? DEFAULT_MODE;
  return raw === "remote" ? "remote" : "local";
}

function getLocalRoot(): string | null {
  const root = process.env.BOOK_VAULT_PATH;
  return root && root.trim().length > 0 ? root : null;
}

function getRemoteRoot(): string | null {
  const base = process.env.BOOK_VAULT_BASE_URL;
  if (!base || base.trim().length === 0) return null;
  return base.replace(/\/$/, "");
}

function buildRemoteUrl(base: string, slug: string, locale: string, format: BookFormat) {
  return `${base}/${slug}/${locale}/${format}/meta.json`;
}

async function readJsonFile(filePath: string): Promise<BookMeta | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as BookMeta;
  } catch {
    return null;
  }
}

async function fetchJson(url: string): Promise<BookMeta | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as BookMeta;
  } catch {
    return null;
  }
}

async function getBookMetaRaw(
  slug: string,
  locale: string,
  format: BookFormat
): Promise<BookMeta | null> {
  const mode = getMode();

  if (mode === "local") {
    const root = getLocalRoot();
    if (!root) return null;
    const filePath = path.join(root, slug, locale, format, "meta.json");
    return readJsonFile(filePath);
  }

  const base = getRemoteRoot();
  if (!base) return null;
  const url = buildRemoteUrl(base, slug, locale, format);
  return fetchJson(url);
}

export async function getBookMeta(
  slug: string,
  locale: string,
  format: BookFormat
): Promise<BookMeta | null> {
  const requested = await getBookMetaRaw(slug, locale, format);
  if (requested) return requested;

  if (locale !== DEFAULT_LOCALE) {
    return getBookMetaRaw(slug, DEFAULT_LOCALE, format);
  }

  return null;
}

export async function listAvailableLocales(slug: string): Promise<string[]> {
  const checks = await Promise.all(
    SUPPORTED_LOCALES.map(async locale => {
      const meta = await getBookMetaRaw(slug, locale, "standard");
      return meta ? locale : null;
    })
  );

  return checks.filter((locale): locale is string => !!locale);
}

export async function listAvailableFormats(
  slug: string,
  locale: string
): Promise<BookFormat[]> {
  const [standard, a5] = await Promise.all([
    getBookMetaRaw(slug, locale, "standard"),
    getBookMetaRaw(slug, locale, "a5")
  ]);

  const formats: BookFormat[] = [];
  if (standard) formats.push("standard");
  if (a5) formats.push("a5");
  return formats;
}
