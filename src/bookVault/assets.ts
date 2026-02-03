import path from "path";
import { getBookMeta, type BookFormat, type BookMeta } from "./bookVault";
import { DEFAULT_LOCALE } from "../i18n/supportedLocales";

export type AssetType = "interactive" | "ebook";

export type ResolvedAsset = {
  mode: "local" | "remote";
  path?: string;
  url?: string;
  meta: BookMeta;
  fileName: string;
  asset: AssetType;
};

export async function resolveAsset(
  slug: string,
  locale: string,
  format: BookFormat,
  asset: AssetType
): Promise<ResolvedAsset | null> {
  let meta = await getBookMeta(slug, locale, format);

  const assetName = meta?.assets?.[asset];

  if (!assetName && locale !== DEFAULT_LOCALE) {
    meta = await getBookMeta(slug, DEFAULT_LOCALE, format);
  }

  const fallbackAssetName = meta?.assets?.[asset];

  if (!fallbackAssetName || !meta) {
    if (process.env.NODE_ENV !== "production") {
      const label = asset === "ebook" ? "Missing ebook asset" : "Missing interactive asset";
      console.warn(label, { slug, locale, format });
    }
    return null;
  }

  const fileName = fallbackAssetName;
  const mode = process.env.BOOK_VAULT_MODE === "remote" ? "remote" : "local";

  if (mode === "local") {
    const root = process.env.BOOK_VAULT_PATH;
    if (!root) return null;
    const filePath = path.join(root, meta.slug, meta.locale, meta.format, fileName);
    return { mode: "local", path: filePath, meta, fileName, asset };
  }

  const base = process.env.BOOK_VAULT_BASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const url = `${base}/${meta.slug}/${meta.locale}/${meta.format}/${fileName}`;
  return { mode: "remote", url, meta, fileName, asset };
}
