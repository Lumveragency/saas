import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReportList, EmptyState } from "@/components/app/ReportList";

export const metadata = { title: "Saved reports — MarketScan" };

export default async function SavedPage() {
  const user = (await getCurrentUser())!;
  const forecasts = await prisma.forecast.findMany({
    where: { userId: user.id, saved: true, status: "complete" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">Saved reports</h1>
          <p className="mt-1 text-sm text-muted">Reports you&apos;ve bookmarked for quick access.</p>
        </div>
        <Link href="/app" className="btn-primary">New research</Link>
      </div>

      <div className="mt-8">
        {forecasts.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            body="Open a completed report and tap Save to keep it here."
            ctaHref="/app/history"
            ctaLabel="Browse history"
          />
        ) : (
          <ReportList items={forecasts} />
        )}
      </div>
    </div>
  );
}
