import { redirect } from "next/navigation";
import LoginForm from "../../../components/LoginForm";
import { getMessages } from "../../../src/i18n/getMessages";
import { t } from "../../../src/i18n/t";
import {
  DEFAULT_LOCALE,
  isSupportedLocale
} from "../../../src/i18n/supportedLocales";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    redirect(`/${DEFAULT_LOCALE}`);
  }

  const messages = await getMessages(locale);
  const translate = t(messages);

  return (
    <LoginForm
      locale={locale}
      title={translate("login.title")}
      subtitle={translate("login.subtitle")}
      emailLabel={translate("login.emailLabel")}
      emailPlaceholder={translate("login.emailPlaceholder")}
      submitLabel={translate("login.submit")}
      sentMessage={translate("login.sent")}
      errorMessage={translate("common.error")}
    />
  );
}
