import { redirect } from "next/navigation";
import Link from "next/link";
import Topbar from "../../../components/Topbar";
import { getMessages } from "../../../src/i18n/getMessages";
import { t } from "../../../src/i18n/t";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale
} from "../../../src/i18n/supportedLocales";

type ComingSoonPageProps = {
  params: { locale: string };
};

export default async function ComingSoonPage({
  params
}: ComingSoonPageProps) {
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
