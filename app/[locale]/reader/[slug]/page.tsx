import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReaderFrame from "../../../../components/ReaderFrame";
import Topbar from "../../../../components/Topbar";
import { sql } from "../../../../src/db/db";
import { getMessages } from "../../../../src/i18n/getMessages";
import { t } from "../../../../src/i18n/t";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale
} from "../../../../src/i18n/supportedLocales";
import { getSessionCookieName, verifySession } from "../../../../src/auth/session";

const AUTH_SECRET = process.env.AUTH_SECRET;

type ReaderPageProps = {
  params: { locale: string; slug: string };
  searchParams?: { format?: string };
};

export default async function ReaderPage({ params, searchParams }: ReaderPageProps) {
  const { locale, slug } = params;

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

  const entitlement = await sql`
    SELECT id
    FROM entitlements
    WHERE user_email = ${email}
      AND slug = ${slug}
      AND product_type = 'bundle'
    LIMIT 1
  `;

  if (entitlement.rows.length === 0) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Topbar
          locale={locale}
          backHref={`/${locale}/library`}
          backLabel={translate("reader.backToLibrary")}
          languageLabel={translate("common.language")}
          fallbackLocale={DEFAULT_LOCALE}
          options={options}
        />
        <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12">
          <h1 className="text-2xl font-semibold">{translate("reader.noAccessTitle")}</h1>
          <p className="text-slate-600">{translate("reader.noAccessBody")}</p>
          <Link
            className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            href={`/${locale}/books/${slug}`}
          >
            {translate("reader.goToBook")}
          </Link>
        </main>
      </div>
    );
  }

  const format = searchParams?.format === "a5" ? "a5" : "standard";
  const iframeSrc = `/api/reader/file?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(
    locale
  )}&format=${encodeURIComponent(format)}&asset=interactive`;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Topbar
        locale={locale}
        backHref={`/${locale}/library`}
        backLabel={translate("reader.backToLibrary")}
        languageLabel={translate("common.language")}
        fallbackLocale={DEFAULT_LOCALE}
        options={options}
      />

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{translate("reader.title")}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            className="text-sm text-slate-600 hover:text-slate-900"
            href={iframeSrc}
            target="_blank"
            rel="noreferrer"
          >
            {translate("reader.openInNewTab")}
          </a>
          <a
            className="text-sm text-slate-600 hover:text-slate-900"
            href={`/api/reader/file?slug=${slug}&locale=${locale}&format=${format}&asset=ebook`}
            target="_blank"
            rel="noreferrer"
          >
            {translate("reader.openEbook")}
          </a>
          <a
            className="text-sm text-slate-600 hover:text-slate-900"
            href={`/api/reader/file?slug=${slug}&locale=${locale}&format=${format}&asset=ebook&download=1`}
            target="_blank"
            rel="noreferrer"
          >
            {translate("reader.downloadEbook")}
          </a>
        </div>
        <ReaderFrame
          src={iframeSrc}
          title={translate("reader.title")}
          loadingLabel={translate("reader.loading")}
        />
      </main>
    </div>
  );
}
