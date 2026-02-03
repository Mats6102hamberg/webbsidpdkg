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
    ORDER BY created_at DESC
  `;

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
                  <p className="text-sm font-medium">{row.slug}</p>
                  <p className="text-xs text-slate-500">
                    {row.product_type} · {row.format}
                  </p>
                </div>
                <Link
                  className="text-sm text-slate-700 hover:text-slate-900"
                  href={`/${locale}/books/${row.slug}`}
                >
                  {translate("library.viewBook")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
