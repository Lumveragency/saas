import Link from "next/link";

export type ReportListItem = {
  id: string;
  question: string;
  createdAt: Date;
  status: string;
  yesProbability: number | null;
  saved: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  complete: "Complete",
  needs_clarification: "Needs clarification",
  error: "Failed",
  researching: "In progress",
  pending: "In progress",
  insufficient_evidence: "Insufficient evidence",
};

export function ReportList({ items }: { items: ReportListItem[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {items.map((f) => {
        const clickable =
          f.status === "complete" ||
          f.status === "needs_clarification" ||
          f.status === "error";
        const row = (
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {f.saved && (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-accent" aria-label="Saved">
                    <path d="M4 3.25h8v9.5L8 10.2l-4 2.55v-9.5Z" />
                  </svg>
                )}
                <p className="truncate text-sm font-medium text-ink">{f.question}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {new Date(f.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" · "}
                {STATUS_LABEL[f.status] ?? f.status}
              </p>
            </div>
            {f.status === "complete" && f.yesProbability !== null ? (
              <div className="shrink-0 text-right">
                <div className="text-lg font-semibold tabular-nums text-accent">
                  {f.yesProbability}%
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted">YES</div>
              </div>
            ) : (
              <span className="shrink-0 text-xs text-muted">{clickable ? "View →" : ""}</span>
            )}
          </div>
        );
        return (
          <li key={f.id}>
            {clickable ? (
              <Link href={`/app/reports/${f.id}`} className="block hover:bg-black/[0.015]">
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function EmptyState({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="card p-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{body}</p>
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} className="btn-primary mt-5">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
