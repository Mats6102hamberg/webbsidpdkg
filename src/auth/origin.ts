import { headers } from "next/headers";

export async function getOriginFromHeaders() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;

  const referer = headerList.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch {
      // ignore invalid referer
    }
  }

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}
