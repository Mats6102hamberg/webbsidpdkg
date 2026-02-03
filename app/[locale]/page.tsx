import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "../../components/Container";
import SiteHeader from "../../components/SiteHeader";
import { getMessages } from "../../src/i18n/getMessages";
import { t } from "../../src/i18n/t";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale
} from "../../src/i18n/supportedLocales";
import { getSessionCookieName, verifySession } from "../../src/auth/session";
import { getBookMeta } from "../../src/bookVault/bookVault";

const AUTH_SECRET = process.env.AUTH_SECRET;

type LocaleHomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    redirect(`/${DEFAULT_LOCALE}`);
  }

  const messages = await getMessages(locale);
  const translate = t(messages);

  const options = SUPPORTED_LOCALES.map(value => ({
    value,
    label: translate(`locales.${value}`)
  }));

  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value ?? "";
  const email = AUTH_SECRET && session ? verifySession(session, AUTH_SECRET) : null;

  const bookMeta = await getBookMeta("petanque-dkg", locale, "standard");
  const bookTitle = bookMeta?.title ?? translate("home.title");
  const bookSubtitle = bookMeta?.subtitle ?? translate("home.subtitle");
  const edition = bookMeta?.edition ?? "";

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
          <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                  {translate("home.title")}
                </h1>
                <p className="mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
                  {translate("home.subtitle")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                  href={`/${locale}/books/petanque-dkg`}
                >
                  {translate("home.primaryCta")}
                </Link>
                <Link
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800"
                  href={email ? `/${locale}/library` : `/${locale}/login`}
                >
                  {email
                    ? translate("home.secondaryCtaLibrary")
                    : translate("home.secondaryCtaLogin")}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {translate("home.value1Title")}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    {translate("home.value1Body")}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {translate("home.value2Title")}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    {translate("home.value2Body")}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {translate("home.value3Title")}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    {translate("home.value3Body")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
                <div className="aspect-[3/4] w-full rounded-xl border border-dashed border-slate-300 bg-slate-100" />
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-900">{bookTitle}</p>
                  <p className="mt-1 text-xs text-slate-600">{bookSubtitle}</p>
                  {edition ? (
                    <p className="mt-3 text-xs text-slate-500">
                      {translate("product.editionLabel")}: {edition}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
