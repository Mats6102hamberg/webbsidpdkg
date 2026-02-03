import { headers } from "next/headers";
import Stripe from "stripe";
import {
  DEFAULT_LOCALE,
  isSupportedLocale
} from "../../../../src/i18n/supportedLocales";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID_BUNDLE;

async function getOrigin() {
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

function errorResponse(message: string, code: string, status = 400) {
  return Response.json({ error: message, code }, { status });
}

export async function POST(req: Request) {
  if (!stripeSecretKey || !priceId) {
    const message = "Stripe env vars saknas. Set STRIPE_SECRET_KEY och STRIPE_PRICE_ID_BUNDLE.";
    return errorResponse(
      process.env.NODE_ENV === "production" ? "Stripe config missing." : message,
      "STRIPE_CONFIG_MISSING",
      500
    );
  }

  let payload: { slug?: string; locale?: string; format?: string };
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Ogiltig JSON payload.", "INVALID_PAYLOAD");
  }

  const slug = (payload.slug ?? "").trim();
  const locale = (payload.locale ?? "").trim();
  const format = (payload.format ?? "").trim();

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return errorResponse("Ogiltig slug.", "INVALID_SLUG");
  }

  if (!isSupportedLocale(locale)) {
    return errorResponse("Ogiltig locale.", "INVALID_LOCALE");
  }

  if (format !== "standard" && format !== "a5") {
    return errorResponse("Ogiltigt format.", "INVALID_FORMAT");
  }

  const origin = await getOrigin();
  if (!origin) {
    return errorResponse("Origin saknas.", "ORIGIN_MISSING", 500);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-01-28.clover"
  });

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/checkout/cancel`,
      metadata: {
        slug,
        locale: locale || DEFAULT_LOCALE,
        format
      }
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Stripe checkout error:", err);
    }
    return errorResponse("Stripe checkout failed.", "STRIPE_CHECKOUT_FAILED", 500);
  }

  return Response.json({ url: session.url });
}
