import path from "path";
import { getBookMeta, type BookFormat, type BookMeta } from "./bookVault";
import { DEFAULT_LOCALE } from "../i18n/supportedLocales";

export type ResolvedAsset = {
  mode: "local" | "remote";
  path?: string;
  url?: string;
  meta: BookMeta;
  fileName: string;
};

export async function resolveInteractiveAsset(
  slug: string,
  locale: string,
  format: BookFormat
): Promise<ResolvedAsset | null> {
  let meta = await getBookMeta(slug, locale, format);

  if (!meta?.assets?.interactive && locale !== DEFAULT_LOCALE) {
    meta = await getBookMeta(slug, DEFAULT_LOCALE, format);
  }

  if (!meta?.assets?.interactive) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Missing interactive asset", { slug, locale, format });
    }
    return null;
  }

  const fileName = meta.assets.interactive;
  const mode = process.env.BOOK_VAULT_MODE === "remote" ? "remote" : "local";

  if (mode === "local") {
    const root = process.env.BOOK_VAULT_PATH;
    if (!root) return null;
    const filePath = path.join(root, meta.slug, meta.locale, meta.format, fileName);
    return { mode: "local", path: filePath, meta, fileName };
  }

  const base = process.env.BOOK_VAULT_BASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const url = `${base}/${meta.slug}/${meta.locale}/${meta.format}/${fileName}`;
  return { mode: "remote", url, meta, fileName };
}
