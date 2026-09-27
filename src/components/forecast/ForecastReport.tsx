import type { Forecast, Evidence, Source } from "@/lib/forecast/schema";
import { ProbabilityMeter } from "@/components/ProbabilityMeter";
import { Disclosure } from "./Disclosure";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-ink">{children}</h2>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function EvidenceList({
  items,
  sources,
  tone,
  emptyNote,
}: {
  items: Evidence[];
  sources: Source[];
  tone: "yes" | "no";
  emptyNote: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyNote}</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((e, i) => {
        const src = e.sourceIndex !== undefined ? sources[e.sourceIndex] : undefined;
        return (
          <li key={i} className="card p-4">
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                  tone === "yes" ? "bg-accent" : "bg-negative"
                }`}
                aria-hidden
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium text-ink">{e.title}</h3>
                  {e.strength && (
                    <span className="rounded-full border border-line px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                      {e.strength}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {e.explanation}
                </p>
                {src && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                  >
                    {hostname(src.url)}
                    {e.publishedDate ? ` · ${e.publishedDate}` : ""}
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ForecastReport({ forecast }: { forecast: Forecast }) {
  const f = forecast;
  return (
    <div className="space-y-8">
      {/* A. Summary */}
      <section className="card p-6 sm:p-8">
        <p className="text-sm text-muted">Question</p>
        <h1 className="mt-1 text-xl font-semibold leading-snug sm:text-2xl">
          {f.question}
        </h1>
        <div className="mt-6 border-t border-line pt-6">
          <ProbabilityMeter yes={f.yesProbability} no={f.noProbability} confidence={f.confidence} />
        </div>
      </section>

      {/* B. Explanation */}
      <section>
        <SectionTitle>Forecast explanation</SectionTitle>
        <p className="text-[15px] leading-relaxed text-ink/90">{f.summary}</p>
      </section>

      {/* C + D. Evidence */}
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <SectionTitle hint="Evidence pointing toward YES">Supporting evidence</SectionTitle>
          <EvidenceList
            items={f.supportingEvidence}
            sources={f.sources}
            tone="yes"
            emptyNote="No clear supporting evidence was found."
          />
        </section>
        <section>
          <SectionTitle hint="Evidence pointing toward NO">Evidence against</SectionTitle>
          <EvidenceList
            items={f.contraryEvidence}
            sources={f.sources}
            tone="no"
            emptyNote="Little direct counter-evidence was found. This absence is itself uncertain and is reflected in the confidence rating."
          />
        </section>
      </div>

      {/* E. Key uncertainty */}
      {f.keyUncertainty && (
        <section className="card border-l-2 border-l-accent p-5">
          <SectionTitle>Key uncertainty</SectionTitle>
          <p className="text-sm leading-relaxed text-muted">{f.keyUncertainty}</p>
        </section>
      )}

      {/* F. What could change the forecast */}
      {f.whatCouldChange.length > 0 && (
        <section>
          <SectionTitle>What could change this forecast</SectionTitle>
          <ul className="space-y-2.5">
            {f.whatCouldChange.map((c, i) => (
              <li key={i} className="card flex items-start gap-3 p-4">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" aria-hidden />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium">{c.title}</h3>
                    {c.expected && (
                      <span className="text-xs text-muted">· {c.expected}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* G. Sources */}
      {f.sources.length > 0 && (
        <section>
          <SectionTitle hint="Links open the original source in a new tab.">
            Sources
          </SectionTitle>
          <ol className="space-y-1.5">
            {f.sources.map((s, i) => (
              <li key={i} className="flex items-baseline gap-3 text-sm">
                <span className="w-5 shrink-0 tabular-nums text-muted">{i + 1}.</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-accent hover:underline"
                >
                  {s.title}
                </a>
                <span className="text-xs text-muted">
                  {hostname(s.url)}
                  {s.publishedDate ? ` · ${s.publishedDate}` : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Assumptions */}
      {f.assumptions.length > 0 && (
        <section>
          <SectionTitle>Assumptions</SectionTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {f.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      {/* H. Methodology */}
      <Disclosure title="Methodology">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink">
              How the question was interpreted
            </dt>
            <dd className="mt-1">{f.methodology.interpretation || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink">
              What was researched
            </dt>
            <dd className="mt-1">{f.methodology.researchApproach || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink">
              Why the probability is uncertain
            </dt>
            <dd className="mt-1">{f.methodology.limitations || "—"}</dd>
          </div>
        </dl>
      </Disclosure>

      {/* I. Disclaimer */}
      <p className="text-xs leading-relaxed text-muted">
        This is an AI-generated estimate produced from public information available at the
        time of analysis. It is not a guarantee, not financial advice, and not a
        recommendation to take any position. Evidence can be incomplete or change.
      </p>
    </div>
  );
}
