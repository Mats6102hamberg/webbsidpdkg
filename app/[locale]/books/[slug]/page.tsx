import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BuyBundleButton from "../../../../components/BuyBundleButton";
import Topbar from "../../../../components/Topbar";
import {
  getBookMeta,
  listAvailableFormats,
  type BookFormat
} from "../../../../src/bookVault/bookVault";
import { sql } from "../../../../src/db/db";
import { getMessages } from "../../../../src/i18n/getMessages";
import { t } from "../../../../src/i18n/t";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale
} from "../../../../src/i18n/supportedLocales";
import { getSessionCookieName, verifySession } from "../../../../src/auth/session";

type BookPageProps = {
  params: { locale: string; slug: string };
  searchParams?: { format?: string };
};

function normalizeFormat(format?: string): BookFormat {
  return format === "a5" ? "a5" : "standard";
}

function buildRemoteAssetUrl(
  baseUrl: string,
  slug: string,
  locale: string,
  format: BookFormat,
  asset: string
) {
  return `${baseUrl}/${slug}/${locale}/${format}/${asset}`;
}

export default async function BookPage({
  params,
  searchParams
}: BookPageProps) {
  const { locale, slug } = params;

  if (!isSupportedLocale(locale)) {
    redirect(`/${DEFAULT_LOCALE}`);
  }

  const messages = await getMessages(locale);
  const translate = t(messages);

  const options = SUPPORTED_LOCALES.map(value => ({
    value,
    label: translate(`locales.${value}`)
  }));

  let isEntitled = false;
  const authSecret = process.env.AUTH_SECRET;
  if (authSecret) {
    const cookieStore = await cookies();
    const session = cookieStore.get(getSessionCookieName())?.value ?? "";
    const email = session ? verifySession(session, authSecret) : null;
    if (email) {
      const entitlement = await sql`
        SELECT id
        FROM entitlements
        WHERE user_email = ${email}
          AND slug = ${slug}
          AND product_type = 'bundle'
        LIMIT 1
      `;
      isEntitled = entitlement.rows.length > 0;
    }
  }

  let selectedFormat = normalizeFormat(searchParams?.format);
  let meta = await getBookMeta(slug, locale, selectedFormat);

  if (!meta && selectedFormat === "a5") {
    selectedFormat = "standard";
    meta = await getBookMeta(slug, locale, "standard");
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Topbar
          locale={locale}
          backHref={`/${locale}`}
          backLabel={translate("common.back")}
          languageLabel={translate("common.language")}
          fallbackLocale={DEFAULT_LOCALE}
          options={options}
        />

        <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12">
          <h1 className="text-2xl font-semibold">
            {translate("product.comingSoonLocaleTitle")}
          </h1>
          <p className="text-sm text-slate-500">{translate("common.error")}</p>
          <p className="text-slate-600">
            {translate("product.comingSoonLocaleBody")}
          </p>
          <Link
            className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            href={`/${DEFAULT_LOCALE}`}
          >
            {translate("product.switchToEnglish")}
          </Link>
        </main>
      </div>
    );
  }

  const formatsForLocale = await listAvailableFormats(slug, locale);
  const fallbackFormats =
    !formatsForLocale.length && locale !== DEFAULT_LOCALE
      ? await listAvailableFormats(slug, DEFAULT_LOCALE)
      : formatsForLocale;

  const hasStandard = fallbackFormats.includes("standard");
  const hasA5 = formatsForLocale.includes("a5");

  const mode = process.env.BOOK_VAULT_MODE ?? "local";
  const baseUrl = process.env.BOOK_VAULT_BASE_URL
    ? process.env.BOOK_VAULT_BASE_URL.replace(/\/$/, "")
    : null;

  const coverUrl =
    mode === "remote" && baseUrl && meta.assets?.cover
      ? buildRemoteAssetUrl(baseUrl, meta.slug, meta.locale, meta.format, meta.assets.cover)
      : null;

  const assetItems = [
    { key: "ebook", label: translate("product.asset_ebook"), value: meta.assets?.ebook },
    {
      key: "interactive",
      label: translate("product.asset_interactive"),
      value: meta.assets?.interactive
    },
    { key: "print", label: translate("product.asset_print"), value: meta.assets?.print }
  ].filter(item => item.value);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Topbar
        locale={locale}
        backHref={`/${locale}`}
        backLabel={translate("common.back")}
        languageLabel={translate("common.language")}
        fallbackLocale={DEFAULT_LOCALE}
        options={options}
      />

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr]">
        <div className="rounded border border-slate-200 bg-slate-50 p-4">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={meta.title}
              width={600}
              height={800}
              className="h-auto w-full rounded"
            />
          ) : (
            <div className="flex h-96 items-center justify-center rounded border border-dashed border-slate-300 text-sm text-slate-500">
              {translate("product.coverPlaceholder")}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold">{meta.title}</h1>
            {meta.subtitle ? (
              <p className="mt-2 text-base text-slate-600">{meta.subtitle}</p>
            ) : null}
            {meta.edition ? (
              <p className="mt-2 text-sm text-slate-500">
                {translate("product.editionLabel")}: {meta.edition}
              </p>
            ) : null}
          </div>

          {meta.description ? (
            <p className="text-base text-slate-700">{meta.description}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-600">
              {translate("product.format")}
            </span>
            <Link
              className={`rounded px-3 py-1 text-sm ${
                selectedFormat === "standard"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
              href={`/${locale}/books/${slug}`}
            >
              {translate("product.format_standard")}
            </Link>
            {hasA5 ? (
              <Link
                className={`rounded px-3 py-1 text-sm ${
                  selectedFormat === "a5"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 text-slate-700"
                }`}
                href={`/${locale}/books/${slug}?format=a5`}
              >
                {translate("product.format_a5")}
              </Link>
            ) : (
              <span className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-400">
                {translate("product.format_a5")} · {translate("product.comingSoonLocaleTitle")}
              </span>
            )}
            {!hasA5 ? (
              <span className="text-xs text-slate-500">
                {translate("product.a5ComingSoonNote")}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-600">
              {translate("product.type")}
            </span>
            <div className="flex flex-wrap gap-2">
              {(meta.variants ?? []).map(variant => (
                <span
                  key={variant.type}
                  className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-600"
                >
                  {translate(`product.type_${variant.type}`, variant.type)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-600">
              {translate("product.buy")}
            </span>
            <div className="flex flex-wrap gap-2">
              {isEntitled ? (
                <div className="flex flex-col gap-2 rounded border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-700">
                    {translate("product.youOwnThis")}
                  </span>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <a
                      className="text-slate-700 hover:text-slate-900"
                      href={`/api/reader/file?slug=${slug}&locale=${locale}&format=${selectedFormat}&asset=ebook`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {translate("product.openEbook")}
                    </a>
                    <a
                      className="text-slate-700 hover:text-slate-900"
                      href={`/api/reader/file?slug=${slug}&locale=${locale}&format=${selectedFormat}&asset=ebook&download=1`}
                    >
                      {translate("product.downloadEbook")}
                    </a>
                  </div>
                </div>
              ) : (
              <BuyBundleButton
                locale={locale}
                slug={slug}
                format={selectedFormat}
                label={translate("product.buyBundle")}
                loadingLabel={translate("common.loading")}
                errorLabel={translate("common.error")}
              />
              )}
              {assetItems.length > 0 ? (
                assetItems.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    disabled
                    className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-400"
                  >
                    {item.label}
                  </button>
                ))
              ) : (
                <span className="text-sm text-slate-500">
                  {translate("product.comingSoonLocaleTitle")}
                </span>
              )}
            </div>
          </div>

          {!hasStandard ? (
            <Link
              className="text-sm text-slate-600 hover:text-slate-900"
              href={`/${locale}/coming-soon`}
            >
              {translate("product.comingSoonLocaleBody")}
            </Link>
          ) : null}
        </div>
      </main>
    </div>
  );
}
