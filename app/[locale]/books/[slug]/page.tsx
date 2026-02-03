import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BuyBundleButton from "../../../../components/BuyBundleButton";
import Container from "../../../../components/Container";
import SiteHeader from "../../../../components/SiteHeader";
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
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: Promise<{ format?: string }>;
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
  const { locale, slug } = await params;
  const query = searchParams ? await searchParams : undefined;

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

  let selectedFormat = normalizeFormat(query?.format);
  let meta = await getBookMeta(slug, locale, selectedFormat);

  if (!meta && selectedFormat === "a5") {
    selectedFormat = "standard";
    meta = await getBookMeta(slug, locale, "standard");
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <SiteHeader
          locale={locale}
          brand={translate("home.title")}
          navItems={[
            { key: translate("nav.books"), href: `/${locale}/books/petanque-dkg` },
            { key: translate("nav.apps"), href: `/${locale}/apps` },
            { key: translate("nav.library"), href: `/${locale}/library` },
            { key: translate("nav.about"), href: `/${locale}/coming-soon` }
          ]}
          languageLabel={translate("common.language")}
          options={options}
          fallbackLocale={DEFAULT_LOCALE}
        />

        <main className="py-12">
          <Container>
            <div className="flex max-w-2xl flex-col gap-4">
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
            </div>
          </Container>
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

  const navItems = [
    { key: translate("nav.books"), href: `/${locale}/books/petanque-dkg` },
    { key: translate("nav.apps"), href: `/${locale}/apps` },
    { key: translate("nav.library"), href: `/${locale}/library` },
    { key: translate("nav.about"), href: `/${locale}/coming-soon` }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white text-slate-900">
      <SiteHeader
        locale={locale}
        brand={translate("home.title")}
        navItems={navItems}
        languageLabel={translate("common.language")}
        options={options}
        fallbackLocale={DEFAULT_LOCALE}
      />

      <main className="py-12">
        <Container>
          <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {meta.edition ? (
                  <span className="rounded-full border border-slate-200 px-3 py-1">
                    {translate("product.editionLabel")}: {meta.edition}
                  </span>
                ) : null}
                <span className="rounded-full border border-slate-200 px-3 py-1">
                  {translate("product.format")} {translate(`product.format_${selectedFormat}`)}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                  {meta.title}
                </h1>
                {meta.subtitle ? (
                  <p className="mt-3 text-base text-slate-600 sm:text-lg">
                    {meta.subtitle}
                  </p>
                ) : null}
              </div>
              {meta.description ? (
                <p className="max-w-2xl text-base text-slate-700">
                  {meta.description}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-600">
                  {translate("product.format")}
                </span>
                <Link
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
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
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                      selectedFormat === "a5"
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 text-slate-700"
                    }`}
                    href={`/${locale}/books/${slug}?format=a5`}
                  >
                    {translate("product.format_a5")}
                  </Link>
                ) : (
                  <span className="rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-400">
                    {translate("product.format_a5")} · {translate("product.comingSoonLocaleTitle")}
                  </span>
                )}
                {!hasA5 ? (
                  <span className="text-xs text-slate-500">
                    {translate("product.a5ComingSoonNote")}
                  </span>
                ) : null}
              </div>
            </div>

            <aside className="flex flex-col gap-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={meta.title}
                    width={600}
                    height={800}
                    className="h-auto w-full rounded-xl"
                  />
                ) : (
                  <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
                    {translate("product.coverPlaceholder")}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
                <h2 className="text-sm font-semibold text-slate-900">
                  {translate("product.purchaseTitle")}
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {isEntitled ? (
                    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 px-3 py-3">
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
                        <Link
                          className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white"
                          href={`/${locale}/library`}
                        >
                          {translate("product.goToLibrary")}
                        </Link>
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
                    <div className="flex flex-wrap gap-2">
                      {assetItems.map(item => (
                        <button
                          key={item.key}
                          type="button"
                          disabled
                          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-400"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">
                      {translate("product.comingSoonLocaleTitle")}
                    </span>
                  )}
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900">
              {translate("product.includedTitle")}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">
                  {translate("product.included1Title")}
                </h3>
                <p className="mt-2 text-xs text-slate-600">
                  {translate("product.included1Body")}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">
                  {translate("product.included2Title")}
                </h3>
                <p className="mt-2 text-xs text-slate-600">
                  {translate("product.included2Body")}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">
                  {translate("product.included3Title")}
                </h3>
                <p className="mt-2 text-xs text-slate-600">
                  {translate("product.included3Body")}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {translate("product.faqTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {translate("product.trustLine")}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {translate("product.faq1Q")}
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    {translate("product.faq1A")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {translate("product.faq2Q")}
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    {translate("product.faq2A")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {translate("product.faq3Q")}
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    {translate("product.faq3A")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
