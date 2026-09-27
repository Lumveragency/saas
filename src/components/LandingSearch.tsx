"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const EXAMPLES = [
  "Will a crewed mission land on the Moon before the end of 2027?",
  "Will global electric vehicle sales exceed 20 million units in 2026?",
  "Will a major AI lab release a model with a 10M-token context window by mid-2026?",
  "Will the US Federal Reserve cut interest rates at its next scheduled meeting?",
];

export function LandingSearch({ authed }: { authed: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(question: string) {
    const value = question.trim();
    if (value.length < 8) return;
    const target = authed
      ? `/app?q=${encodeURIComponent(value)}`
      : `/signup?q=${encodeURIComponent(value)}`;
    router.push(target);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        className="card flex flex-col gap-3 p-2.5 shadow-pop sm:flex-row sm:items-center sm:gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={280}
          placeholder="Ask a question about a future event..."
          aria-label="Ask a question about a future event"
          className="w-full bg-transparent px-3 py-2.5 text-[15px] text-ink placeholder:text-muted/70 focus:outline-none"
        />
        <button type="submit" className="btn-primary shrink-0 sm:w-auto">
          Analyze question
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-muted">
        AI-generated forecasts are estimates, not guarantees.
      </p>

      <div className="mt-8">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-muted">
          Try an example
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQ(ex);
                submit(ex);
              }}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-left text-xs text-muted transition-colors hover:border-ink/20 hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
