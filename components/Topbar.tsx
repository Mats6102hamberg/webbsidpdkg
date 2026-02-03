import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

type Option = { value: string; label: string };

type TopbarProps = {
  locale: string;
  backHref: string;
  backLabel: string;
  languageLabel: string;
  fallbackLocale: string;
  options: Option[];
};

export default function Topbar({
  locale,
  backHref,
  backLabel,
  languageLabel,
  fallbackLocale,
  options
}: TopbarProps) {
  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link className="text-sm text-slate-600 hover:text-slate-900" href={backHref}>
          {backLabel}
        </Link>
        <LanguageSwitcher
          currentLocale={locale}
          options={options}
          label={languageLabel}
          fallbackLocale={fallbackLocale}
        />
      </div>
    </header>
  );
}
