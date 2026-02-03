import { sql } from "../../../../src/db/db";
import { generateToken, hashToken } from "../../../../src/auth/tokens";
import { getOriginFromHeaders } from "../../../../src/auth/origin";
import { isSupportedLocale, DEFAULT_LOCALE } from "../../../../src/i18n/supportedLocales";

const APP_BASE_URL = process.env.APP_BASE_URL;

function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let payload: { email?: string; locale?: string };
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Ogiltig JSON payload.");
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  const locale = (payload.locale ?? "").trim();

  if (!email || !email.includes("@")) {
    return errorResponse("Ogiltig email.");
  }

  const safeLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;

  let userId: string | null = null;
  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.rows.length > 0) {
    userId = existing.rows[0].id as string;
  } else {
    await sql`INSERT INTO users (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
    const created = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    userId = created.rows[0]?.id ?? null;
  }

  if (!userId) {
    return errorResponse("Kunde inte skapa användare.", 500);
  }

  const token = generateToken();
  const tokenHash = hashToken(token);

  await sql`
    INSERT INTO login_tokens (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, NOW() + interval '15 minutes')
  `;

  const origin = APP_BASE_URL ?? (await getOriginFromHeaders());
  if (!origin) {
    return errorResponse("Origin saknas.", 500);
  }

  const loginUrl = `${origin}/api/auth/verify?token=${token}&locale=${safeLocale}`;

  if (process.env.NODE_ENV !== "production") {
    console.log("Magic link:", loginUrl);
  }

  return Response.json({ ok: true });
}
