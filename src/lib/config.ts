// Centralized, typed access to environment configuration.
// Never import secret values into client components.

export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "",

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    forecastModel: process.env.FORECAST_MODEL ?? "claude-sonnet-5",
    parserModel: process.env.PARSER_MODEL ?? "claude-haiku-4-5-20251001",
    maxWebSearches: intFromEnv(process.env.MAX_WEB_SEARCHES, 6),
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    pricePro: process.env.STRIPE_PRICE_PRO ?? "",
    priceScale: process.env.STRIPE_PRICE_SCALE ?? "",
  },

  limits: {
    proMonthly: intFromEnv(process.env.PRO_MONTHLY_LIMIT, 100),
    scaleMonthly: intFromEnv(process.env.SCALE_MONTHLY_LIMIT, 500),
    maxQuestionLength: 280,
    minQuestionLength: 12,
  },
} as const;

export function isAnthropicConfigured(): boolean {
  return config.anthropic.apiKey.length > 0;
}

export function isStripeConfigured(): boolean {
  return (
    config.stripe.secretKey.length > 0 &&
    config.stripe.pricePro.length > 0
  );
}

function intFromEnv(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
