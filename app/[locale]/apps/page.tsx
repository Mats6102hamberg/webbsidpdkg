import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StartSubscriptionButton from "../../../components/StartSubscriptionButton";
import Topbar from "../../../components/Topbar";
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
};

export default async function AppsPage({ params }: AppsPageProps) {
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
  const subState = "";

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

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold">{translate("apps.title")}</h1>
          <p className="mt-2 text-slate-600">{translate("apps.subtitle")}</p>
        </div>

        {subState === "success" ? (
          <p className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {translate("apps.subscribedTitle")}
          </p>
        ) : null}

        {subState === "cancel" ? (
          <p className="rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {translate("checkout.cancelBody")}
          </p>
        ) : null}

        {!email ? (
          <div className="rounded border border-slate-200 px-4 py-4">
            <p className="text-sm text-slate-700">{translate("apps.loginRequired")}</p>
            <Link className="mt-3 inline-flex text-sm text-slate-700 hover:text-slate-900" href={`/${locale}/login`}>
              {translate("login.title")}
            </Link>
          </div>
        ) : isActive ? (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-4">
            <h2 className="text-sm font-semibold text-emerald-900">
              {translate("apps.subscribedTitle")}
            </h2>
            <p className="mt-1 text-sm text-emerald-800">{translate("apps.subscribedBody")}</p>
          </div>
        ) : (
          <div className="rounded border border-slate-200 px-4 py-4">
            <StartSubscriptionButton
              locale={locale}
              label={translate("apps.startSubscription")}
              loadingLabel={translate("common.loading")}
              errorLabel={translate("common.error")}
            />
          </div>
        )}
      </main>
    </div>
  );
}
