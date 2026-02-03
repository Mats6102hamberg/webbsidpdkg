import { cookies } from "next/headers";
import Stripe from "stripe";
import { sql } from "../../../../src/db/db";
import { getOriginFromHeaders } from "../../../../src/auth/origin";
import { getSessionCookieName, verifySession } from "../../../../src/auth/session";
import { isSupportedLocale } from "../../../../src/i18n/supportedLocales";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const authSecret = process.env.AUTH_SECRET;
const appBaseUrl = process.env.APP_BASE_URL;
const portalReturnBase = process.env.STRIPE_CUSTOMER_PORTAL_RETURN_URL;

function errorResponse(message: string, code: string, status = 400) {
  return Response.json({ error: message, code }, { status });
}

export async function POST(req: Request) {
  if (!stripeSecretKey) {
    return errorResponse("Stripe config missing.", "STRIPE_CONFIG_MISSING", 500);
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

  const entitlement = await sql`
    SELECT stripe_subscription_id
    FROM entitlements
    WHERE user_email = ${email}
      AND product_type = 'app_access'
      AND stripe_subscription_id IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const subscriptionId = entitlement.rows[0]?.stripe_subscription_id ?? null;
  if (!subscriptionId) {
    return errorResponse("Subscription not found.", "SUBSCRIPTION_NOT_FOUND", 404);
  }

  const origin = portalReturnBase || appBaseUrl || (await getOriginFromHeaders());
  if (!origin) {
    return errorResponse("Origin saknas.", "ORIGIN_MISSING", 500);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null;

    if (!customerId) {
      return errorResponse("Customer not found.", "CUSTOMER_NOT_FOUND", 404);
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/${locale}/apps`
    });

    return Response.json({ url: portalSession.url });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Stripe billing portal error:", err);
    }
    return errorResponse("Stripe portal failed.", "STRIPE_PORTAL_FAILED", 500);
  }
}
