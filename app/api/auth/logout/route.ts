import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isSupportedLocale } from "../../../../src/i18n/supportedLocales";
import { getSessionCookieName } from "../../../../src/auth/session";

function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let payload: { locale?: string };
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Ogiltig JSON payload.");
  }

  const locale = isSupportedLocale(payload.locale ?? "") ? payload.locale! : DEFAULT_LOCALE;

  const cookieStore = await cookies();
  cookieStore.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return Response.json({ ok: true, redirect: `/${locale}/login` });
}
