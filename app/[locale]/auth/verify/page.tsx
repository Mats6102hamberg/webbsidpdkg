import Link from "next/link";
import { redirect } from "next/navigation";
import { getMessages } from "../../../../src/i18n/getMessages";
import { t } from "../../../../src/i18n/t";
import {
  DEFAULT_LOCALE,
  isSupportedLocale
} from "../../../../src/i18n/supportedLocales";

type VerifyPageProps = {
  params: { locale: string };
  searchParams?: { reason?: string };
};

export default async function VerifyPage({ params, searchParams }: VerifyPageProps) {
  const { locale } = params;

  if (!isSupportedLocale(locale)) {
    redirect(`/${DEFAULT_LOCALE}`);
  }

  const messages = await getMessages(locale);
  const translate = t(messages);
  const reason = searchParams?.reason ?? "";

  const reasonLabel = ["missing", "invalid", "expired", "used"].includes(reason)
    ? reason
    : "";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto flex max-w-md flex-col gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold">{translate("auth.invalidLinkTitle")}</h1>
        <p className="text-slate-600">{translate("auth.invalidLinkBody")}</p>
        {reasonLabel ? (
          <p className="text-xs text-slate-500">{reasonLabel}</p>
        ) : null}
        <Link
          className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          href={`/${locale}/login`}
        >
          {translate("auth.requestNewLink")}
        </Link>
      </main>
    </div>
  );
}
