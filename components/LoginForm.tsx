"use client";

import { useState } from "react";

type LoginFormProps = {
  locale: string;
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitLabel: string;
  sentMessage: string;
  errorMessage: string;
};

export default function LoginForm({
  locale,
  title,
  subtitle,
  emailLabel,
  emailPlaceholder,
  submitLabel,
  sentMessage,
  errorMessage
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale })
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-slate-600">{emailLabel}</span>
            <input
              type="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder={emailPlaceholder}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            disabled={status === "loading"}
          >
            {submitLabel}
          </button>
        </form>

        {status === "sent" ? (
          <p className="text-sm text-emerald-600">{sentMessage}</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-rose-600">{errorMessage}</p>
        ) : null}
      </main>
    </div>
  );
}
