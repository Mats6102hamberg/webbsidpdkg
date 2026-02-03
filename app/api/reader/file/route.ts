import { cookies } from "next/headers";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { sql } from "../../../../src/db/db";
import { getSessionCookieName, verifySession } from "../../../../src/auth/session";
import { isSupportedLocale } from "../../../../src/i18n/supportedLocales";
import { resolveAsset, type AssetType } from "../../../../src/bookVault/assets";

export const runtime = "nodejs";

function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function GET(req: Request) {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    return errorResponse("Auth config missing.", 500);
  }

  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") ?? "").trim();
  const locale = (searchParams.get("locale") ?? "").trim();
  const format = (searchParams.get("format") ?? "").trim();
  const asset = (searchParams.get("asset") ?? "").trim();
  const download = searchParams.get("download") ?? "";

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return errorResponse("Ogiltig slug.");
  }

  if (!isSupportedLocale(locale)) {
    return errorResponse("Ogiltig locale.");
  }

  if (format !== "standard" && format !== "a5") {
    return errorResponse("Ogiltigt format.");
  }

  if (asset !== "interactive" && asset !== "ebook") {
    return errorResponse("Ogiltig asset.");
  }
  const assetType = asset as AssetType;

  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value ?? "";
  const email = session ? verifySession(session, authSecret) : null;

  if (!email) {
    return errorResponse("Unauthorized.", 401);
  }

  const entitlement = await sql`
    SELECT id
    FROM entitlements
    WHERE user_email = ${email}
      AND slug = ${slug}
      AND product_type = 'bundle'
    LIMIT 1
  `;

  if (entitlement.rows.length === 0) {
    return errorResponse("Forbidden.", 403);
  }

  const resolved = await resolveAsset(slug, locale, format, assetType);
  if (!resolved) {
    return errorResponse("Not found.", 404);
  }

  const isDownload = assetType === "ebook" && download === "1";
  const filename = assetType === "ebook"
    ? `${slug}-${locale}-${format}-ebook.pdf`
    : `${slug}-interactive.pdf`;

  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename=\"${filename}\"`
  });

  try {
    if (resolved.mode === "local" && resolved.path) {
      await stat(resolved.path);
      headers.set("Content-Type", "application/pdf");
      const fileStream = createReadStream(resolved.path);
      const body = Readable.toWeb(fileStream) as ReadableStream<Uint8Array>;
      return new Response(body, { headers });
    }

    if (resolved.mode === "remote" && resolved.url) {
      const upstream = await fetch(resolved.url, { cache: "no-store" });
      if (!upstream.ok || !upstream.body) {
        return errorResponse("Not found.", 404);
      }
      headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/pdf");
      return new Response(upstream.body, { headers });
    }
  } catch {
    return errorResponse("Server error.", 500);
  }

  return errorResponse("Not found.", 404);
}
