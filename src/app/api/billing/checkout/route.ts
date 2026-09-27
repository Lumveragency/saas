import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, TRIAL_DAYS, TRIAL_FEE_CENTS } from "@/lib/stripe";
import { config, isStripeConfigured } from "@/lib/config";
import { z } from "zod";

const bodySchema = z.object({ plan: z.enum(["pro", "scale"]).default("pro") });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Billing is not configured. Set STRIPE_SECRET_KEY and price IDs." },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }
  const plan = parsed.data.plan;
  const priceId = plan === "scale" ? config.stripe.priceScale : config.stripe.pricePro;
  if (!priceId) {
    return NextResponse.json(
      { error: `The ${plan} plan is not configured.` },
      { status: 503 },
    );
  }

  const stripe = getStripe();

  // Ensure a Stripe customer exists for this user.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Pro plan gets the $1 / 7-day trial. Scale is billed immediately.
  const isTrialPlan = plan === "pro";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: isTrialPlan
      ? [
          { price: priceId, quantity: 1 },
          {
            // One-time $1 trial fee, charged at checkout.
            price_data: {
              currency: "usd",
              unit_amount: TRIAL_FEE_CENTS,
              product_data: { name: `MarketScan ${TRIAL_DAYS}-day trial` },
            },
            quantity: 1,
          },
        ]
      : [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { userId: user.id, plan },
      ...(isTrialPlan
        ? {
            trial_period_days: TRIAL_DAYS,
            trial_settings: {
              end_behavior: { missing_payment_method: "cancel" },
            },
          }
        : {}),
    },
    payment_method_collection: "always",
    allow_promotion_codes: true,
    success_url: `${config.appUrl}/app/billing?status=success`,
    cancel_url: `${config.appUrl}/pricing?status=canceled`,
  });

  return NextResponse.json({ url: session.url });
}
