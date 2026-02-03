import { cookies } from "next/headers";
import Stripe from "stripe";
import { getOriginFromHeaders } from "../../../../../src/auth/origin";
import { getSessionCookieName, verifySession } from "../../../../../src/auth/session";
import { isSupportedLocale } from "../../../../../src/i18n/supportedLocales";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID_APP_SUB;
const authSecret = process.env.AUTH_SECRET;
const appBaseUrl = process.env.APP_BASE_URL;

function errorResponse(message: string, code: string, status = 400) {
  return Response.json({ error: message, code }, { status });
}

export async function POST(req: Request) {
  if (!stripeSecretKey || !priceId) {
    const message = "Stripe env vars saknas. Set STRIPE_SECRET_KEY och STRIPE_PRICE_ID_APP_SUB.";
    return errorResponse(
      process.env.NODE_ENV === "production" ? "Stripe config missing." : message,
      "STRIPE_CONFIG_MISSING",
      500
    );
  }

  if (!authSecret) {
    return errorResponse("Auth config missing.", "AUTH_CONFIG_MISSING", 500);
  }

  let payload: { locale?: string };
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Ogiltig JSON payload.", "INVALID_PAYLOAD");
  }

  const locale = (payload.locale ?? "").trim();
  if (!isSupportedLocale(locale)) {
    return errorResponse("Ogiltig locale.", "INVALID_LOCALE");
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value ?? "";
  const email = session ? verifySession(session, authSecret) : null;

  if (!email) {
    return errorResponse("Unauthorized.", "UNAUTHORIZED", 401);
  }

  const origin = appBaseUrl || (await getOriginFromHeaders());
  if (!origin) {
    return errorResponse("Origin saknas.", "ORIGIN_MISSING", 500);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  let sessionResponse: Stripe.Checkout.Session;
  try {
    sessionResponse = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/${locale}/apps?sub=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/apps?sub=cancel`,
      customer_email: email,
      metadata: {
        product_type: "app_access",
        slug: "boule-apps",
        format: "standard"
      }
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Stripe subscription checkout error:", err);
    }
    return errorResponse("Stripe checkout failed.", "STRIPE_CHECKOUT_FAILED", 500);
  }

  return Response.json({ url: sessionResponse.url });
}
