import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "../../../components/LogoutButton";
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

type LibraryPageProps = {
  params: { locale: string };
};

export default async function LibraryPage({ params }: LibraryPageProps) {
  const { locale } = params;

  if (!isSupportedLocale(locale)) {
    redirect(`/${DEFAULT_LOCALE}`);
  }

  if (!AUTH_SECRET) {
    redirect(`/${locale}/login`);
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value ?? "";
  const email = session ? verifySession(session, AUTH_SECRET) : null;

  if (!email) {
    redirect(`/${locale}/login`);
  }

  const messages = await getMessages(locale);
  const translate = t(messages);

  const options = SUPPORTED_LOCALES.map(value => ({
    value,
    label: translate(`locales.${value}`)
  }));

  const entitlements = await sql`
    SELECT id, slug, format, product_type
    FROM entitlements
    WHERE user_email = ${email}
      AND product_type = 'bundle'
    ORDER BY created_at DESC
  `;

  const appAccess = await sql`
    SELECT status
    FROM entitlements
    WHERE user_email = ${email}
      AND product_type = 'app_access'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const appStatus = appAccess.rows[0]?.status ?? null;
  const appActive = appStatus === "active" || appStatus === "trialing";

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
          <h1 className="text-2xl font-semibold">{translate("library.title")}</h1>
          <p className="mt-2 text-slate-600">{translate("library.subtitle")}</p>
        </div>
        <LogoutButton
          locale={locale}
          label={translate("auth.logout")}
          loadingLabel={translate("auth.loggingOut")}
        />

        <section className="rounded border border-slate-200 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            {translate("library.appAccessTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {appActive
              ? translate("library.appAccessActive")
              : translate("library.appAccessInactive")}
          </p>
          {!appActive ? (
            <Link
              className="mt-3 inline-flex text-sm text-slate-700 hover:text-slate-900"
              href={`/${locale}/apps`}
            >
              {translate("apps.startSubscription")}
            </Link>
          ) : null}
        </section>

        {entitlements.rows.length === 0 ? (
          <p className="text-sm text-slate-500">{translate("library.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entitlements.rows.map(row => (
              <li
                key={row.id}
                className="flex items-center justify-between rounded border border-slate-200 px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{row.slug}</p>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {row.format === "a5"
                        ? translate("product.format_a5")
                        : translate("product.format_standard")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {row.product_type} · {row.format}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Link
                    className="text-slate-700 hover:text-slate-900"
                    href={`/${locale}/books/${row.slug}`}
                  >
                    {translate("library.viewBook")}
                  </Link>
                  <Link
                    className="text-slate-700 hover:text-slate-900"
                    href={`/${locale}/reader/${row.slug}`}
                  >
                    {translate("library.readInteractive")}
                  </Link>
                  <Link
                    className="text-slate-700 hover:text-slate-900"
                    href={`/api/reader/file?slug=${row.slug}&locale=${locale}&format=${row.format}&asset=ebook`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {translate("library.openEbook")}
                  </Link>
                  <Link
                    className="text-slate-700 hover:text-slate-900"
                    href={`/api/reader/file?slug=${row.slug}&locale=${locale}&format=${row.format}&asset=ebook&download=1`}
                  >
                    {translate("library.downloadEbook")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
