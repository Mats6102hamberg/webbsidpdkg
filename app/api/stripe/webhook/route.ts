import Stripe from "stripe";
import { sql } from "../../../../src/db/db";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function errorResponse(message: string, status = 400) {
  return new Response(message, { status });
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

    if (email && slug && format) {
      await sql`
        INSERT INTO entitlements (user_email, slug, format, product_type, stripe_session_id)
        VALUES (${email}, ${slug}, ${format}, 'bundle', ${session.id})
        ON CONFLICT (stripe_session_id) DO NOTHING
      `;
    }
  }

  return new Response("OK", { status: 200 });
}
