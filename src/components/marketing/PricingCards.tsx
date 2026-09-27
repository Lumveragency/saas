"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Plan = {
  id: "free" | "pro" | "scale";
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "one analysis",
    blurb: "Run a single full research report to see how it works.",
    features: ["One research report", "Full evidence & sources", "Saved to your history"],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$27",
    cadence: "per month",
    blurb: "For ongoing research. Starts with a $1, 7-day trial.",
    features: [
      "100 research reports / month",
      "Full reports, sources & methodology",
      "Forecast history",
      "Access to new features",
    ],
    cta: "Start $1 trial",
    highlight: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "$79",
    cadence: "per month",
    blurb: "For heavier research workloads.",
    features: [
      "500 research reports / month",
      "Everything in Pro",
      "Priority research queue",
      "Early access to new categories",
    ],
    cta: "Choose Scale",
  },
];

export function PricingCards({ authed }: { authed: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(plan: Plan) {
    setError(null);
    if (!authed) {
      router.push(`/signup?next=${encodeURIComponent(plan.id === "free" ? "/app" : "/pricing")}`);
      return;
    }
    if (plan.id === "free") {
      router.push("/app");
      return;
    }
    setBusy(plan.id);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Could not start checkout.");
        setBusy(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`card flex flex-col p-6 ${
              plan.highlight ? "ring-1 ring-accent" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{plan.name}</h3>
              {plan.highlight && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                  Most popular
                </span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tracking-[-0.02em]">{plan.price}</span>
              <span className="text-sm text-muted">{plan.cadence}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{plan.blurb}</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-accent" aria-hidden>
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-muted">{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => choose(plan)}
              disabled={busy === plan.id}
              className={`mt-6 ${plan.highlight ? "btn-primary" : "btn-secondary"} w-full`}
            >
              {busy === plan.id ? "Redirecting…" : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-center text-sm text-negative">{error}</p>}

      <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-line bg-surface p-4 text-xs leading-relaxed text-muted">
        <span className="font-medium text-ink">Pro trial terms:</span> You&apos;ll be
        charged <span className="font-medium text-ink">$1 today</span> for a{" "}
        <span className="font-medium text-ink">7-day trial</span>. After the trial it renews
        automatically at <span className="font-medium text-ink">$27/month</span> unless you
        cancel. You can cancel anytime from your billing settings before the renewal date and
        will not be charged the monthly fee.
      </div>
    </div>
  );
}
