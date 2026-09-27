"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Extraction } from "@/lib/forecast/schema";

const MAX_BYTES = 6 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const RESEARCH_STEPS = [
  "Confirming the question",
  "Researching current information",
  "Evaluating evidence for and against",
  "Estimating the probability",
];

type Review = {
  question: string;
  deadline: string;
  ex: Extraction;
};

type Stage =
  | { k: "empty" }
  | { k: "extracting" }
  | { k: "review"; review: Review }
  | { k: "unclear"; reason: string }
  | { k: "analyzing"; step: number }
  | { k: "limit"; message: string }
  | { k: "error"; message: string };

export function ScreenshotWorkspace({ canAnalyze }: { canAnalyze: boolean }) {
  const router = useRouter();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>({ k: "empty" });
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (stepTimer.current) clearInterval(stepTimer.current);
    stepTimer.current = null;
  };
  useEffect(() => clearTimer, []);

  const runExtraction = useCallback(async (url: string) => {
    setStage({ k: "extracting" });
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStage({ k: "error", message: data.error ?? "Could not read the image." });
        return;
      }
      const ex = data.extraction as Extraction;
      if (!ex.clear || !ex.question) {
        setStage({
          k: "unclear",
          reason:
            ex.reason ??
            "The screenshot wasn't clear enough to read a question. Try a sharper, less-cropped image.",
        });
        return;
      }
      setStage({
        k: "review",
        review: { question: ex.question, deadline: ex.deadline ?? "", ex },
      });
    } catch {
      setStage({ k: "error", message: "Network error while reading the image." });
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        setStage({ k: "error", message: "Please upload a PNG, JPEG, WebP, or GIF image." });
        return;
      }
      if (file.size > MAX_BYTES) {
        setStage({ k: "error", message: "That image is too large. Please keep it under 6 MB." });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setDataUrl(url);
        void runExtraction(url);
      };
      reader.onerror = () => setStage({ k: "error", message: "Could not read that file." });
      reader.readAsDataURL(file);
    },
    [runExtraction],
  );

  // Paste-from-clipboard support.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            return;
          }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  function reset() {
    clearTimer();
    setDataUrl(null);
    setStage({ k: "empty" });
    if (fileInput.current) fileInput.current.value = "";
  }

  async function analyze(review: Review) {
    setStage({ k: "analyzing", step: 0 });
    clearTimer();
    stepTimer.current = setInterval(() => {
      setStage((s) =>
        s.k === "analyzing" && s.step < RESEARCH_STEPS.length - 1
          ? { k: "analyzing", step: s.step + 1 }
          : s,
      );
    }, 3000);

    try {
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "screenshot",
          question: review.question,
          yesDefinition: review.ex.yesDefinition,
          noDefinition: review.ex.noDefinition,
          deadline: review.deadline || review.ex.deadline,
          platform: review.ex.platform,
          marketImpliedYes: review.ex.marketImpliedYes ?? null,
        }),
      });
      const data = await res.json();
      clearTimer();
      if (res.status === 402) {
        setStage({ k: "limit", message: data.error ?? "You've reached your analysis limit." });
        return;
      }
      if (res.ok && data.id && data.status === "complete") {
        router.push(`/app/reports/${data.id}`);
        return;
      }
      setStage({ k: "error", message: data.error ?? "The analysis could not be completed." });
    } catch {
      clearTimer();
      setStage({ k: "error", message: "Network error. Please try again." });
    }
  }

  const showDropzone = stage.k === "empty";
  const busy = stage.k === "extracting" || stage.k === "analyzing";

  return (
    <div>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {showDropzone ? (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
            dragging ? "border-accent bg-accent-soft/60" : "border-line bg-surface hover:border-accent/40 hover:bg-accent-soft/20"
          }`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
              <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <span className="mt-5 text-lg font-semibold text-ink">Upload a prediction screenshot</span>
          <span className="mt-2 max-w-md text-sm text-muted">
            Get an AI-powered research report with estimated probabilities and supporting evidence.
          </span>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_-4px_rgba(37,99,235,0.5)]">
            Choose image
          </span>
          <span className="mt-4 text-xs text-muted">
            Drag &amp; drop, or paste from clipboard · PNG, JPEG, WebP up to 6 MB
          </span>
        </button>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Preview */}
          <div>
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              {dataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dataUrl} alt="Uploaded screenshot" className="max-h-[360px] w-full object-contain" />
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={busy}
                className="btn-secondary px-3.5 py-2 text-xs"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={busy}
                className="btn-ghost px-3.5 py-2 text-xs"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Right panel: state-dependent */}
          <div>
            {stage.k === "extracting" && (
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
                  <p className="text-sm font-medium">Reading the screenshot…</p>
                </div>
                <p className="mt-2 text-sm text-muted">
                  Extracting the question, outcomes, deadline, and any displayed probability.
                </p>
              </div>
            )}

            {stage.k === "unclear" && (
              <div className="card border-l-2 border-l-amber-400 p-5">
                <p className="text-sm font-medium">We couldn&apos;t read this clearly</p>
                <p className="mt-1 text-sm text-muted">{stage.reason}</p>
                <button type="button" onClick={() => fileInput.current?.click()} className="btn-primary mt-4">
                  Upload a clearer image
                </button>
              </div>
            )}

            {stage.k === "review" && (
              <ReviewPanel
                review={stage.review}
                canAnalyze={canAnalyze}
                onChange={(review) => setStage({ k: "review", review })}
                onAnalyze={() => analyze(stage.review)}
              />
            )}

            {stage.k === "analyzing" && (
              <div className="card p-5">
                <ul className="space-y-3">
                  {RESEARCH_STEPS.map((label, i) => {
                    const active = i === stage.step;
                    const done = i < stage.step;
                    return (
                      <li key={label} className="flex items-center gap-3 text-sm">
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
                            done ? "bg-ink text-surface" : active ? "bg-accent text-surface" : "bg-line text-muted"
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
                <p className="mt-4 text-xs text-muted">Researching with live web search — usually 15–40 seconds.</p>
              </div>
            )}

            {stage.k === "limit" && (
              <div className="card border-l-2 border-l-accent p-5">
                <p className="text-sm font-medium">{stage.message}</p>
                <Link href="/pricing" className="btn-primary mt-4">View plans</Link>
              </div>
            )}

            {stage.k === "error" && (
              <div className="card border-l-2 border-l-negative p-5">
                <p className="text-sm text-ink">{stage.message}</p>
                <button type="button" onClick={() => dataUrl && runExtraction(dataUrl)} className="btn-secondary mt-4">
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewPanel({
  review,
  canAnalyze,
  onChange,
  onAnalyze,
}: {
  review: Review;
  canAnalyze: boolean;
  onChange: (r: Review) => void;
  onAnalyze: () => void;
}) {
  const { ex } = review;
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
        Confirm the question
      </p>
      <label htmlFor="ex-question" className="sr-only">Extracted question</label>
      <textarea
        id="ex-question"
        value={review.question}
        onChange={(e) => onChange({ ...review, question: e.target.value })}
        rows={3}
        maxLength={280}
        className="input mt-2 resize-none"
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="ex-deadline" className="label text-xs">Deadline</label>
          <input
            id="ex-deadline"
            value={review.deadline}
            onChange={(e) => onChange({ ...review, deadline: e.target.value })}
            placeholder="e.g. Dec 31, 2027"
            className="input"
          />
        </div>
        <div>
          <span className="label text-xs">Detected</span>
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {ex.platform && (
              <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                {ex.platform}
              </span>
            )}
            {ex.marketImpliedYes !== undefined && ex.marketImpliedYes !== null ? (
              <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                Market: {ex.marketImpliedYes}% YES
              </span>
            ) : (
              <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                No market price
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        We&apos;ll research this independently — the market price is context, not the answer.
      </p>

      {canAnalyze ? (
        <button
          type="button"
          onClick={onAnalyze}
          disabled={review.question.trim().length < 8}
          className="btn-primary mt-4 w-full"
        >
          Analyze question
        </button>
      ) : (
        <div className="mt-4 rounded-lg border border-line bg-canvas p-3">
          <p className="text-sm font-medium">You&apos;ve used your free analysis.</p>
          <Link href="/pricing" className="btn-primary mt-3 w-full">View plans</Link>
        </div>
      )}
    </div>
  );
}
