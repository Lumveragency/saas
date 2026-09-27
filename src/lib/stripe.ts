import "server-only";
import Stripe from "stripe";
import { config } from "@/lib/config";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!config.stripe.secretKey) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.",
    );
  }
  if (!cached) {
    // Omit apiVersion so the SDK uses its own pinned version — avoids a
    // literal-type mismatch when the installed SDK's pinned version changes.
    cached = new Stripe(config.stripe.secretKey, {
      appInfo: { name: "MarketScan" },
    });
  }
  return cached;
}

export const PLAN_BY_PRICE: Record<string, "pro" | "scale"> = {};
if (config.stripe.pricePro) PLAN_BY_PRICE[config.stripe.pricePro] = "pro";
if (config.stripe.priceScale) PLAN_BY_PRICE[config.stripe.priceScale] = "scale";

// Billing model (see README "Billing model"):
//   • A one-time $1.00 line item is charged at checkout for the 7-day trial.
//   • The Pro subscription ($27/mo recurring) is created with a 7-day trial
//     (trial_period_days), so the first recurring charge lands on day 8.
//   • After that it renews monthly at $27 unless canceled.
// All of these terms are disclosed on the subscribe screen before payment.
export const TRIAL_DAYS = 7;
export const TRIAL_FEE_CENTS = 100;
export const TRIAL_PRICE_LABEL = "$1 for 7 days";
