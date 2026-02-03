"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { SUPPORTED_LOCALES } from "../src/i18n/supportedLocales";

type Option = { value: string; label: string };

type LanguageSwitcherProps = {
  currentLocale: string;
  options: Option[];
  label: string;
  fallbackLocale: string;
};

export default function LanguageSwitcher({
  currentLocale,
  options,
  label,
  fallbackLocale
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleChange = (nextLocale: string) => {
    const target = SUPPORTED_LOCALES.includes(nextLocale as never)
      ? nextLocale
      : fallbackLocale;

    const parts = pathname.split("/");
    if (parts.length > 1) {
      parts[1] = target;
    } else {
      parts.push(target);
    }

    const nextPath = parts.join("/") || "/";

    document.cookie = `locale=${target}; path=/; max-age=31536000`;

    startTransition(() => {
      router.push(nextPath);
    });
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <select
        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
        value={currentLocale}
        onChange={event => handleChange(event.target.value)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
