"use client";

import { useState } from "react";

type LogoutButtonProps = {
  locale: string;
  label: string;
  loadingLabel?: string;
};

export default function LogoutButton({ locale, label, loadingLabel }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale })
      });

      if (response.ok) {
        const payload = await response.json().catch(() => null);
        if (payload?.redirect) {
          window.location.href = payload.redirect;
          return;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-slate-600 hover:text-slate-900"
      disabled={isLoading}
    >
      {isLoading && loadingLabel ? loadingLabel : label}
    </button>
  );
}
