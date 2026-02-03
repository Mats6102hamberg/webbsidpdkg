"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

type NavItem = {
  key: string;
  href: string;
};

type LanguageOption = {
  value: string;
  label: string;
};

type SiteHeaderProps = {
  locale: string;
  brand: string;
  navItems: NavItem[];
  languageLabel: string;
  options: LanguageOption[];
  fallbackLocale: string;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export default function SiteHeader({
  locale,
  brand,
  navItems,
  languageLabel,
  options,
  fallbackLocale
}: SiteHeaderProps) {
  const pathname = usePathname() ?? "";

  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link className="text-sm font-semibold text-slate-900" href={`/${locale}`}>
            {brand}
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            {navItems.map(item => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={
                    active
                      ? "rounded-full bg-slate-900 px-3 py-1 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }
                >
                  {item.key}
                </Link>
              );
            })}
          </nav>
        </div>
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
