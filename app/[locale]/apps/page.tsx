import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "../../../components/Container";
import SiteHeader from "../../../components/SiteHeader";
import StartSubscriptionButton from "../../../components/StartSubscriptionButton";
import ManageSubscriptionButton from "../../../components/ManageSubscriptionButton";
import { sql } from "../../../src/db/db";
import { getMessages } from "../../../src/i18n/getMessages";
import { t } from "../../../src/i18n/t";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale
} from "../../../src/i18n/supportedLocales";
import { getSessionCookieName, verifySession } from "../../../src/auth/session";

const AUTH_SECRET = process.env.AUTH_SECRET;

type AppsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ sub?: string }>;
};

export default async function AppsPage({ params, searchParams }: AppsPageProps) {
  const { locale } = await params;
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

  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value ?? "";
  const email = AUTH_SECRET && session ? verifySession(session, AUTH_SECRET) : null;

  let status: string | null = null;
  if (email) {
    const appEntitlement = await sql`
      SELECT status
      FROM entitlements
      WHERE user_email = ${email}
        AND product_type = 'app_access'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    status = appEntitlement.rows[0]?.status ?? null;
  }

  const isActive = status === "active" || status === "trialing";
  const subState = query?.sub ?? "";

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
          <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                  {translate("apps.title")}
                </h1>
                <p className="mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
                  {translate("apps.subtitle")}
                </p>
              </div>

              {subState === "success" ? (
                <p className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">
                  {translate("apps.subscribedTitle")}
                </p>
              ) : null}

              {subState === "cancel" ? (
                <p className="w-fit rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
                  {translate("checkout.cancelBody")}
                </p>
              ) : null}

              {!email ? (
                <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                  <p className="text-sm text-slate-700">
                    {translate("apps.loginRequired")}
                  </p>
                  <Link
                    className="mt-4 inline-flex rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-800"
                    href={`/${locale}/login`}
                  >
                    {translate("home.secondaryCtaLogin")}
                  </Link>
                </div>
              ) : isActive ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-emerald-900">
                    {translate("apps.subscribedTitle")}
                  </h2>
                  <p className="mt-2 text-sm text-emerald-800">
                    {translate("apps.subscribedBody")}
                  </p>
                  <div className="mt-4">
                    <ManageSubscriptionButton
                      locale={locale}
                      label={translate("apps.manageSubscription")}
                      loadingLabel={translate("apps.manageSubscriptionLoading")}
                      errorLabel={translate("apps.manageSubscriptionError")}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                  <StartSubscriptionButton
                    locale={locale}
                    label={translate("apps.startSubscription")}
                    loadingLabel={translate("common.loading")}
                    errorLabel={translate("common.error")}
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {translate("apps.value1Title")}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    {translate("apps.value1Body")}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {translate("apps.value2Title")}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    {translate("apps.value2Body")}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {translate("apps.value3Title")}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    {translate("apps.value3Body")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.4)]">
                <div className="absolute right-5 top-5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Apps
                </div>
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {translate("apps.value1Title")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {translate("apps.value1Body")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {translate("apps.value2Title")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {translate("apps.value2Body")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {translate("apps.value3Title")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {translate("apps.value3Body")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
