import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getEntitlement } from "@/lib/entitlements";
import { AnalyzeForm } from "@/components/AnalyzeForm";

export const metadata = { title: "New analysis — MarketScan" };

export default async function AppHome({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = (await getCurrentUser())!;
  const entitlement = await getEntitlement(user);
  const { q } = await searchParams;

  const remaining = Math.max(entitlement.limit - entitlement.used, 0);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">New analysis</h1>
            <p className="mt-1 text-sm text-muted">
              Ask about a future event and get an evidence-backed probability.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted">{entitlement.plan.name} plan</div>
            <div className="text-sm font-medium tabular-nums">
              {entitlement.isSubscriber
                ? `${remaining} of ${entitlement.limit} left`
                : entitlement.canAnalyze
                  ? "1 free analysis"
                  : "Free analysis used"}
            </div>
          </div>
        </div>

        <div className="card mt-8 p-6">
          <AnalyzeForm
            initialQuestion={q ?? ""}
            autostart={!!q}
            canAnalyze={entitlement.canAnalyze}
          />
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/app/history" className="text-accent hover:underline">
            View past reports →
          </Link>
          {!entitlement.isSubscriber && (
            <Link href="/pricing" className="text-muted hover:text-ink">
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
