"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type State =
  | { kind: "idle" }
  | { kind: "loading"; step: number }
  | { kind: "clarification"; message: string }
  | { kind: "limit"; message: string }
  | { kind: "error"; message: string };

const STEPS = [
  "Parsing the question",
  "Identifying the event and deadline",
  "Researching current information",
  "Evaluating the evidence",
  "Generating the forecast",
];

export function AnalyzeForm({
  initialQuestion = "",
  autostart = false,
  canAnalyze,
}: {
  initialQuestion?: string;
  autostart?: boolean;
  canAnalyze: boolean;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState(initialQuestion);
  const [state, setState] = useState<State>({ kind: "idle" });
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(false);

  const clearTimer = () => {
    if (stepTimer.current) clearInterval(stepTimer.current);
    stepTimer.current = null;
  };

  const analyze = useCallback(
    async (value: string) => {
      const q = value.trim();
      if (q.length < 8) {
        setState({ kind: "error", message: "Please enter a more complete question." });
        return;
      }
      setState({ kind: "loading", step: 0 });
      clearTimer();
      stepTimer.current = setInterval(() => {
        setState((s) =>
          s.kind === "loading" && s.step < STEPS.length - 1
            ? { kind: "loading", step: s.step + 1 }
            : s,
        );
      }, 2600);

      try {
        const res = await fetch("/api/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        });
        const data = await res.json();
        clearTimer();

        if (res.status === 402) {
          setState({
            kind: "limit",
            message: data.error ?? "You've reached your analysis limit.",
          });
          return;
        }
        if (!res.ok && data.status !== "needs_clarification") {
          setState({
            kind: "error",
            message: data.error ?? "Something went wrong. Please try again.",
          });
          return;
        }
        if (data.status === "needs_clarification") {
          setState({ kind: "clarification", message: data.clarification });
          return;
        }
        if (data.id && data.status === "complete") {
          router.push(`/app/reports/${data.id}`);
          return;
        }
        setState({ kind: "error", message: "Unexpected response. Please try again." });
      } catch {
        clearTimer();
        setState({ kind: "error", message: "Network error. Please try again." });
      }
    },
    [router],
  );

  useEffect(() => {
    if (autostart && initialQuestion.trim().length >= 8 && !started.current && canAnalyze) {
      started.current = true;
      void analyze(initialQuestion);
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = state.kind === "loading";

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void analyze(question);
        }}
      >
        <label htmlFor="question" className="label">
          Ask a question about a future event
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={280}
          rows={3}
          disabled={loading}
          placeholder="e.g. Will company X announce a new product before June 2026?"
          className="input resize-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">{question.length}/280</span>
          <button type="submit" disabled={loading || !canAnalyze} className="btn-primary">
            {loading ? "Analyzing…" : "Analyze question"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          AI-generated forecasts are estimates, not guarantees.
        </p>
      </form>

      {!canAnalyze && state.kind === "idle" && (
        <div className="card mt-6 border-l-2 border-l-accent p-5">
          <p className="text-sm font-medium">You&apos;ve used your free analysis.</p>
          <p className="mt-1 text-sm text-muted">
            Subscribe to keep researching future events with full reports and history.
          </p>
          <Link href="/pricing" className="btn-primary mt-4">
            View plans
          </Link>
        </div>
      )}

      {loading && (
        <div className="card mt-6 p-5">
          <ul className="space-y-3">
            {STEPS.map((label, i) => {
              const active = i === state.step;
              const done = i < state.step;
              return (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
                      done
                        ? "bg-ink text-surface"
                        : active
                          ? "bg-accent text-surface"
                          : "bg-line text-muted"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={active ? "text-ink" : done ? "text-muted" : "text-muted/60"}>
                    {label}
                    {active && <span className="ml-1 animate-pulse">…</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Researching with live web search — this usually takes 15–40 seconds.
          </p>
        </div>
      )}

      {state.kind === "clarification" && (
        <div className="card mt-6 border-l-2 border-l-amber-400 p-5">
          <p className="text-sm font-medium">One clarification needed</p>
          <p className="mt-1 text-sm text-muted">{state.message}</p>
          <p className="mt-3 text-xs text-muted">
            Edit your question above with this detail and analyze again.
          </p>
        </div>
      )}

      {state.kind === "limit" && (
        <div className="card mt-6 border-l-2 border-l-accent p-5">
          <p className="text-sm font-medium">{state.message}</p>
          <Link href="/pricing" className="btn-primary mt-4">
            View plans
          </Link>
        </div>
      )}

      {state.kind === "error" && (
        <div className="card mt-6 border-l-2 border-l-negative p-5">
          <p className="text-sm text-ink">{state.message}</p>
        </div>
      )}
    </div>
  );
}
