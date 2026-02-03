import { cookies } from "next/headers";
import { sql } from "../../../../src/db/db";
import { hashToken } from "../../../../src/auth/tokens";
import { getSessionCookieName, signSession } from "../../../../src/auth/session";
import { DEFAULT_LOCALE, isSupportedLocale } from "../../../../src/i18n/supportedLocales";

const AUTH_SECRET = process.env.AUTH_SECRET;

export async function GET(req: Request) {
  if (!AUTH_SECRET) {
    return new Response("Auth config missing.", { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const localeParam = searchParams.get("locale") ?? DEFAULT_LOCALE;
  const locale = isSupportedLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const failureUrl = new URL(`/${locale}/auth/verify`, req.url);

  if (!token) {
    failureUrl.searchParams.set("reason", "missing");
    return Response.redirect(failureUrl);
  }

  const tokenHash = hashToken(token);

  const result = await sql`
    SELECT lt.id, lt.expires_at, lt.used_at, u.email
    FROM login_tokens lt
    JOIN users u ON u.id = lt.user_id
    WHERE lt.token_hash = ${tokenHash}
    LIMIT 1
  `;

  if (result.rows.length === 0) {
    failureUrl.searchParams.set("reason", "invalid");
    return Response.redirect(failureUrl);
  }

  const row = result.rows[0] as {
    id: string;
    expires_at: Date;
    used_at: Date | null;
    email: string;
  };

  if (row.used_at || new Date(row.expires_at) < new Date()) {
    failureUrl.searchParams.set("reason", row.used_at ? "used" : "expired");
    return Response.redirect(failureUrl);
  }

  await sql`
    UPDATE login_tokens
    SET used_at = NOW()
    WHERE id = ${row.id}
  `;

  const cookieValue = signSession(row.email, AUTH_SECRET);
  const cookieStore = await cookies();
  cookieStore.set({
    name: getSessionCookieName(),
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return Response.redirect(new URL(`/${locale}/library`, req.url));
}
