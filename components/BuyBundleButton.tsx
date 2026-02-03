"use client";

import { useState } from "react";

type BuyBundleButtonProps = {
  locale: string;
  slug: string;
  format: "standard" | "a5";
  label: string;
  loadingLabel: string;
  errorLabel: string;
};

export default function BuyBundleButton({
  locale,
  slug,
  format,
  label,
  loadingLabel,
  errorLabel
}: BuyBundleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, locale, format })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error ?? errorLabel;
        setError(message);
        return;
      }

      const payload = await response.json();
      if (payload?.url) {
        window.location.href = payload.url;
      } else {
        setError(errorLabel);
      }
    } catch {
      setError(errorLabel);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isLoading ? loadingLabel : label}
      </button>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}
