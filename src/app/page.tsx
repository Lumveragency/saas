import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PricingCards } from "@/components/marketing/PricingCards";
import { ProbabilityMeter } from "@/components/ProbabilityMeter";
import { SAMPLE_FORECAST } from "@/lib/forecast/sample";

const HOW = [
  {
    n: "01",
    title: "Upload a screenshot",
    body: "Drop in a screenshot of a prediction market or a future-event question. MarketScan reads the question, outcomes, deadline, and any displayed price.",
  },
  {
    n: "02",
    title: "AI researches the evidence",
    body: "It searches current sources, separates evidence for and against, and weighs reliability — instead of copying the market price.",
  },
  {
    n: "03",
    title: "Get a transparent estimate",
    body: "A probability with its reasoning, supporting and contrary evidence, key uncertainties, sources, and a methodology you can inspect.",
  },
];

const FAQ = [
  {
    q: "How does the screenshot upload work?",
    a: "Upload a screenshot of a prediction-market or future-event question. A vision model reads the question, outcomes, deadline, and any displayed probability — reporting only what's actually visible. You confirm or correct the question before research begins.",
  },
  {
    q: "How is the probability calculated?",
    a: "MarketScan researches current information with live web search, separates supporting and contrary evidence, and produces a probability grounded in what it found. It never simply copies the market price — that's shown separately for comparison. Every estimate is labeled as an AI-generated estimate.",
  },
  {
    q: "Is this a prediction market or betting product?",
    a: "No. MarketScan does not connect to any market, execute trades, or recommend positions. It's a research tool for understanding uncertainty and evaluating evidence.",
  },
  {
    q: "Are the sources real?",
    a: "Yes. Forecasts cite sources retrieved during research, and every source links to the original page. When evidence is thin, the report says so rather than inventing support.",
  },
  {
    q: "What does the trial cost?",
    a: "Pro starts with a $1 charge for a 7-day trial, then renews at $27/month unless you cancel. You can cancel anytime from billing settings before the renewal date.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const authed = !!user;
  const f = SAMPLE_FORECAST;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Blue hero band with the nav overlaid on top */}
      <div className="relative overflow-hidden hero-blue">
        <div className="absolute inset-0 hero-dots opacity-60" aria-hidden />
        <SiteNav authed={authed} onDark />
        <section className="container-page relative pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              AI research for future events — not a betting product
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-[-0.035em] text-white sm:text-[68px]">
              Understand what&apos;s
              <br className="hidden sm:block" /> likely to happen.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Upload a screenshot of any prediction. MarketScan reads it, researches the
              evidence, and returns a transparent probability estimate.
            </p>
          </div>

          {/* Screenshot-upload call to action */}
          <div className="mx-auto mt-10 max-w-xl">
            <Link
              href={authed ? "/app" : "/signup"}
              className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/40 bg-white/10 px-6 py-12 text-center backdrop-blur transition-colors hover:border-white/70 hover:bg-white/15"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-accent">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
                  <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <span className="mt-4 text-base font-semibold text-white">
                Upload a prediction screenshot
              </span>
              <span className="mt-1.5 text-sm text-white/70">
                Get an AI-powered research report with probabilities and evidence.
              </span>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-accent">
                {authed ? "Open workspace" : "Get started free"} →
              </span>
            </Link>
            <p className="mt-3 text-center text-xs text-white/70">
              AI-generated forecasts are estimates, not guarantees.
            </p>
          </div>
        </section>
      </div>

      <main className="flex-1">

        {/* How it works */}
        <section id="how-it-works" className="border-t border-line bg-surface">
          <div className="container-page py-16 sm:py-20">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 max-w-xl text-2xl font-semibold sm:text-3xl">
              A research pipeline, not a chatbot.
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {HOW.map((step) => (
                <div key={step.n}>
                  <div className="font-mono text-xs text-muted">{step.n}</div>
                  <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Example report */}
        <section className="container-page py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Example report</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                What a forecast looks like.
              </h2>
            </div>
            <span className="hidden shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted sm:inline">
              Illustrative example
            </span>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className="card p-6 lg:col-span-2">
              <p className="text-sm text-muted">Question</p>
              <p className="mt-1 text-base font-medium leading-snug">{f.question}</p>
              <div className="mt-6 border-t border-line pt-6">
                <ProbabilityMeter
                  yes={f.yesProbability}
                  no={f.noProbability}
                  confidence={f.confidence}
                  size="sm"
                />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted">{f.summary}</p>
            </div>

            <div className="grid gap-4 lg:col-span-3 sm:grid-cols-2">
              <div className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Supports YES
                </p>
                <ul className="mt-3 space-y-3">
                  {f.supportingEvidence.map((e, i) => (
                    <li key={i}>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{e.explanation}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-negative">
                  Supports NO
                </p>
                <ul className="mt-3 space-y-3">
                  {f.contraryEvidence.map((e, i) => (
                    <li key={i}>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{e.explanation}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Key uncertainty
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.keyUncertainty}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-line bg-surface">
          <div className="container-page py-16 sm:py-20">
            <div className="mx-auto max-w-xl text-center">
              <p className="eyebrow">Pricing</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                Start free. Upgrade when it&apos;s useful.
              </h2>
              <p className="mt-3 text-sm text-muted">
                One free analysis, no card required. Pro starts with a $1, 7-day trial.
              </p>
            </div>
            <div className="mt-10">
              <PricingCards authed={authed} />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container-page py-16 sm:py-20">
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Common questions</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-sm font-semibold">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12 flex flex-col items-start gap-4 rounded-xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold">Ready to research a question?</p>
              <p className="mt-1 text-sm text-muted">Your first analysis is free.</p>
            </div>
            <Link href={authed ? "/app" : "/signup"} className="btn-primary">
              {authed ? "Open app" : "Get started"}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
