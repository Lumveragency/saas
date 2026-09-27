import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getEntitlement } from "@/lib/entitlements";
import { prisma } from "@/lib/db";
import { Workspace } from "@/components/app/Workspace";

export const metadata = { title: "Research — MarketScan" };

const EXAMPLES = [
  "Will a crewed mission land on the Moon before the end of 2027?",
  "Will global EV sales exceed 20 million units in 2026?",
  "Will the US Federal Reserve cut rates at its next scheduled meeting?",
];

export default async function AppHome({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = (await getCurrentUser())!;
  const entitlement = await getEntitlement(user);
  const { q } = await searchParams;

  const recent = await prisma.forecast.findMany({
    where: { userId: user.id, status: "complete" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
          Analyze a prediction
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-[15px] text-muted">
          Upload a screenshot of a prediction market or future-event question. MarketScan reads
          it, researches the evidence, and returns a transparent probability estimate.
        </p>
      </header>

      <Workspace
        canAnalyze={entitlement.canAnalyze}
        examples={EXAMPLES}
        initialQuestion={q ?? ""}
        autostart={!!q}
      />

      {recent.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent reports</h2>
            <Link href="/app/history" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {recent.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/app/reports/${f.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-black/[0.015]"
                >
                  <span className="truncate text-sm text-ink">{f.question}</span>
                  {f.yesProbability !== null && (
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-accent">
                      {f.yesProbability}%
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
