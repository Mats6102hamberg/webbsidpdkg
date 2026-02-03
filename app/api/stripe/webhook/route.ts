import Stripe from "stripe";
import { sql } from "../../../../src/db/db";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function errorResponse(message: string, status = 400) {
  return new Response(message, { status });
}

type EntitlementStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | string;

function mapStripeStatus(status: string): EntitlementStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return status;
  }
}

export async function POST(req: Request) {
  if (!stripeSecretKey || !webhookSecret) {
    return errorResponse("Stripe webhook config missing.", 500);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return errorResponse("Missing Stripe signature.", 400);
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Stripe webhook error:", err);
    }
    return errorResponse("Invalid webhook signature.", 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email ?? session.customer_email ?? null;
    const slug = session.metadata?.slug ?? null;
    const format = session.metadata?.format ?? null;
    const isSubscription =
      session.mode === "subscription" || session.metadata?.product_type === "app_access";

    if (isSubscription && email) {
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;
      const status = mapStripeStatus("active");

      if (subscriptionId) {
        const updated = await sql`
          UPDATE entitlements
          SET
            user_email = ${email},
            slug = 'boule-apps',
            format = 'standard',
            product_type = 'app_access',
            status = ${status}
          WHERE stripe_subscription_id = ${subscriptionId}
          RETURNING id
        `;

        if (updated.rows.length === 0) {
          await sql`
            INSERT INTO entitlements (
              user_email,
              slug,
              format,
              product_type,
              stripe_session_id,
              stripe_subscription_id,
              status
            )
            VALUES (
              ${email},
              'boule-apps',
              'standard',
              'app_access',
              ${session.id},
              ${subscriptionId},
              ${status}
            )
            ON CONFLICT (stripe_session_id) DO UPDATE SET
              stripe_subscription_id = EXCLUDED.stripe_subscription_id,
              status = EXCLUDED.status
          `;
        }
      } else {
        await sql`
          INSERT INTO entitlements (
            user_email,
            slug,
            format,
            product_type,
            stripe_session_id,
            stripe_subscription_id,
            status
          )
          VALUES (
            ${email},
            'boule-apps',
            'standard',
            'app_access',
            ${session.id},
            ${subscriptionId},
            ${status}
          )
          ON CONFLICT (stripe_session_id) DO UPDATE SET
            stripe_subscription_id = EXCLUDED.stripe_subscription_id,
            status = EXCLUDED.status
        `;
      }
    }

    if (!isSubscription && email && slug && format) {
      await sql`
        INSERT INTO entitlements (user_email, slug, format, product_type, stripe_session_id)
        VALUES (${email}, ${slug}, ${format}, 'bundle', ${session.id})
        ON CONFLICT (stripe_session_id) DO NOTHING
      `;
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const status = mapStripeStatus(subscription.status);
    await sql`
      UPDATE entitlements
      SET status = ${status}
      WHERE stripe_subscription_id = ${subscription.id}
    `;
  }

  return new Response("OK", { status: 200 });
}
