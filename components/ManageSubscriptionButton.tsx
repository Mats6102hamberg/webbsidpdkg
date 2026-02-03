"use client";

import { useState } from "react";

type ManageSubscriptionButtonProps = {
  locale: string;
  label: string;
  loadingLabel: string;
  errorLabel: string;
  className?: string;
};

export default function ManageSubscriptionButton({
  locale,
  label,
  loadingLabel,
  errorLabel,
  className
}: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale })
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
        className={
          className ??
          "rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-800"
        }
      >
        {isLoading ? loadingLabel : label}
      </button>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}
