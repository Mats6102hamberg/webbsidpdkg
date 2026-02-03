import Link from "next/link";
import { redirect } from "next/navigation";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { getMessages } from "../../src/i18n/getMessages";
import { t } from "../../src/i18n/t";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale
} from "../../src/i18n/supportedLocales";

type LocaleHomePageProps = {
  params: { locale: string };
};

export default async function LocaleHomePage({
  params
}: LocaleHomePageProps) {
  const { locale } = params;

  if (!isSupportedLocale(locale)) {
    redirect(`/${DEFAULT_LOCALE}`);
  }

  const messages = await getMessages(locale);
  const translate = t(messages);

  const options = SUPPORTED_LOCALES.map(value => ({
    value,
    label: translate(`locales.${value}`)
  }));

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-slate-700 hover:text-slate-900" href={`/${locale}`}>
              {translate("nav.books")}
            </Link>
            <span className="text-slate-500">{translate("nav.library")}</span>
            <span className="text-slate-500">{translate("nav.about")}</span>
          </nav>
          <LanguageSwitcher
            currentLocale={locale}
            options={options}
            label={translate("common.language")}
            fallbackLocale={DEFAULT_LOCALE}
          />
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold">{translate("home.title")}</h1>
          <p className="mt-2 text-base text-slate-600">
            {translate("home.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            href={`/${locale}/books/petanque-dkg`}
          >
            {translate("nav.books")}
          </Link>
          <Link
            className="text-sm text-slate-600 hover:text-slate-900"
            href={`/${locale}/coming-soon`}
          >
            {translate("product.comingSoonLocaleTitle")}
          </Link>
        </div>
      </main>
    </div>
  );
}
