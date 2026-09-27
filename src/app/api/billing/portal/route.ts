import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { config, isStripeConfigured } from "@/lib/config";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!isStripeConfigured() || !user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${config.appUrl}/app/billing`,
  });

  return NextResponse.json({ url: session.url });
}
