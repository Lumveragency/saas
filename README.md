# MarketScan

**Understand what's likely to happen.** MarketScan is an AI-powered research
product for forecasting future events. Ask a question about a future event, and
it researches current information, weighs the evidence for and against, and
returns a transparent YES/NO probability with sources, uncertainties, and a full
methodology.

It is a **research tool**, not a betting or prediction-market product. It does
not connect to markets, execute trades, or recommend positions.

---

## What was built

A complete, production-shaped MVP:

- **Landing page** — hero with a live question input, "how it works", an
  illustrative example report, pricing, and FAQ.
- **Authentication** — email/password sign up / sign in / sign out with hashed
  passwords (bcrypt) and signed JWT session cookies (httpOnly, SameSite=Lax).
- **Research engine** — a real multi-stage pipeline (not a single prompt):
  1. **Parse** the question and decide if it's a well-formed YES/NO forecast;
     ask for clarification when it isn't (no invented dates/definitions).
  2. **Research + evaluate + forecast** using Claude with its built-in
     **web search** tool, separating supporting vs. contrary evidence.
  3. **Validate** the structured output (Zod) and **drop any source URL that
     was not actually retrieved during search** (anti-hallucination).
- **Result page** — probability meter, explanation, supporting/contrary
  evidence with sources, key uncertainty, "what could change", full source
  list, expandable methodology, and disclaimer.
- **Forecast history** — every analysis is stored and re-openable (no re-charge).
- **Subscriptions (Stripe)** — Free (1 analysis) → Pro ($1/7-day trial, then
  $27/mo) → Scale ($79/mo), with server-side Checkout, the billing portal
  (cancel/renew/invoices), and a verified webhook that syncs subscription state.
- **Usage & cost control** — server-side entitlement checks, monthly limits,
  per-user rate limiting, input-length caps, duplicate-request reuse, and
  internal per-analysis cost tracking (never shown to users).

### Architecture

```
src/
  app/                      # Next.js App Router
    page.tsx                # landing
    login/ signup/          # auth pages
    pricing/                # public pricing
    app/                    # authenticated product (guarded by layout)
      page.tsx              #   new analysis
      reports/[id]/         #   forecast result
      history/              #   past reports
      billing/              #   plan & subscription
    api/
      auth/{signup,login,logout}/
      forecast/             # runs the research pipeline (server-side)
      billing/{checkout,portal}/
      stripe/webhook/       # signature-verified subscription sync
  lib/
    config.ts               # typed env access
    db.ts                   # Prisma client
    auth.ts                 # sessions, password hashing
    entitlements.ts         # plans, limits, "can this user analyze?"
    validation.ts           # zod schemas + in-memory rate limiter
    stripe.ts               # Stripe client + plan mapping
    forecast/
      schema.ts             # structured forecast types + validation
      client.ts             # Anthropic client + cost estimation
      parse.ts              # Stage 1: question parsing
      research.ts           # Stages 2-4: research + forecast
      engine.ts             # pipeline orchestrator
  components/               # UI (marketing, app, forecast report)
prisma/schema.prisma        # User + Forecast models
```

**Stack:** Next.js 15 (App Router, TypeScript, React 19) · Tailwind CSS ·
Prisma (SQLite by default, Postgres-ready) · Anthropic Claude API (web search)
· Stripe.

---

## Run it locally

Requirements: Node 20+.

```bash
# 1. Install
npm install            # generates the Prisma client automatically

# 2. Configure environment
cp .env.example .env
#   - set AUTH_SECRET   (openssl rand -base64 48)
#   - set ANTHROPIC_API_KEY to enable real forecasts
#   - (optional) Stripe keys to enable real billing

# 3. Create the database (SQLite)
npm run db:push

# 4. Start
npm run dev            # http://localhost:3000
```

Without `ANTHROPIC_API_KEY`, the app runs and every screen works, but running an
analysis returns a clear "research engine is not configured" message — nothing
is faked. The same is true for Stripe: billing endpoints return a clear
"not configured" response until keys are set.

---

## Required credentials

| Variable | Required for | Where to get it |
|---|---|---|
| `AUTH_SECRET` | Sessions (always) | `openssl rand -base64 48` |
| `DATABASE_URL` | Database (always) | SQLite default is fine locally; use a Postgres URL in prod |
| `ANTHROPIC_API_KEY` | The research engine | https://console.anthropic.com/settings/keys |
| `STRIPE_SECRET_KEY` | Billing | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Billing webhooks | `stripe listen` or a dashboard webhook endpoint |
| `STRIPE_PRICE_PRO` | Pro plan | A recurring $27/mo price in Stripe |
| `STRIPE_PRICE_SCALE` | Scale plan (optional) | A recurring $79/mo price in Stripe |
| `NEXT_PUBLIC_APP_URL` | Stripe redirects | Your public URL (e.g. `https://marketscan.app`) |

The research engine uses **Claude's built-in web search tool**, so a single
`ANTHROPIC_API_KEY` covers both reasoning and source retrieval — no separate
search-provider key is needed.

### Stripe setup

1. Create two **recurring** prices in the Stripe dashboard: $27/mo (Pro) and,
   optionally, $79/mo (Scale). Put their IDs in `STRIPE_PRICE_PRO` /
   `STRIPE_PRICE_SCALE`.
2. Add a webhook endpoint pointing at `/api/stripe/webhook` and subscribe to
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`. Put the
   signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

**Billing model.** The Pro plan charges a one-time **$1 today** at checkout and
starts a **7-day trial** on the $27/mo subscription; the first monthly charge
lands on day 8 and renews monthly unless canceled. These terms are disclosed on
the subscribe screen before payment. Cancellation, payment method, and invoices
are handled by Stripe's hosted billing portal.

---

## Deploy

1. **Database:** provision Postgres and set `DATABASE_URL`. Change
   `prisma/schema.prisma` `datasource` provider from `sqlite` to `postgresql`,
   then run `npx prisma migrate deploy` (or `prisma db push`).
2. **Host:** deploy to any Node host or Vercel. Set all environment variables in
   the host's dashboard. `npm run build` runs `prisma generate` first.
3. **Stripe webhook:** point the dashboard webhook at
   `https://<your-domain>/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.
4. Set `NEXT_PUBLIC_APP_URL` to the deployed URL.

---

## Security notes

- All model and Stripe calls are **server-side only**; no secret ever reaches
  the client.
- Subscription status is **never trusted from the client** — it's read from the
  database, written only by the verified Stripe webhook and checkout flow.
- Stripe webhooks are **signature-verified** with the raw request body.
- Retrieved web content is treated as **untrusted data, not instructions** (the
  forecast system prompt explicitly forbids following embedded instructions),
  mitigating prompt injection from pages.
- Input length is capped, requests are rate-limited per user, and duplicate
  identical questions reuse the stored report instead of re-running research.

---

## Limitations & honest notes

- **Calibration is not measured.** Probabilities are AI-generated estimates. The
  product deliberately does not claim to be "calibrated" — it isn't, until
  measured against outcomes.
- **Synchronous analysis.** The pipeline runs within the request (typically
  15–40s). For heavier production load, move it to a background job/queue and
  poll the report status (the schema already has a `status` field for this).
- **In-memory rate limiter.** Fine for a single instance; back it with Redis for
  multi-instance deployments.
- **Trial fee timing.** Depending on your Stripe trial configuration, the $1 fee
  may be collected at trial start; the code uses `trial_period_days` plus a
  one-time line item. Verify the exact behavior against your Stripe account.
- **Higher tier (Scale)** is wired end-to-end but intentionally not the default;
  no unimplemented features are advertised.
