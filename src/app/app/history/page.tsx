import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "History — MarketScan" };

const STATUS_LABEL: Record<string, string> = {
  complete: "Complete",
  needs_clarification: "Needs clarification",
  error: "Failed",
  researching: "In progress",
  pending: "In progress",
};

export default async function HistoryPage() {
  const user = (await getCurrentUser())!;
  const forecasts = await prisma.forecast.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">History</h1>
            <p className="mt-1 text-sm text-muted">Your previous analyses.</p>
          </div>
          <Link href="/app" className="btn-primary">New analysis</Link>
        </div>

        {forecasts.length === 0 ? (
          <div className="card mt-8 p-10 text-center">
            <p className="text-sm font-medium">No analyses yet</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
              Ask a question about a future event to generate your first report.
            </p>
            <Link href="/app" className="btn-primary mt-5">Start analyzing</Link>
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {forecasts.map((f) => {
              const clickable = f.status === "complete" || f.status === "needs_clarification" || f.status === "error";
              const row = (
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{f.question}</p>
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
                      <div className="text-lg font-semibold tabular-nums">{f.yesProbability}%</div>
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
        )}
      </div>
    </div>
  );
}
