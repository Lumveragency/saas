import { getCurrentUser } from "@/lib/auth";
import { getEntitlement, isSubscriber } from "@/lib/entitlements";
import { BillingActions } from "@/components/app/BillingActions";

export const metadata = { title: "Billing — MarketScan" };

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const STATUS_LABEL: Record<string, string> = {
  trialing: "Trial active",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
  incomplete: "Incomplete",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = (await getCurrentUser())!;
  const entitlement = await getEntitlement(user);
  const subscribed = isSubscriber(user);
  const { status } = await searchParams;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Billing</h1>
        <p className="mt-1 text-sm text-muted">Manage your plan and subscription.</p>

        {status === "success" && (
          <div className="card mt-6 border-l-2 border-l-positive p-4 text-sm">
            Your subscription is being activated. It may take a few seconds to appear below.
          </div>
        )}

        <div className="card mt-8 divide-y divide-line">
          <Row label="Current plan" value={entitlement.plan.name} />
          <Row
            label="Status"
            value={
              subscribed
                ? (STATUS_LABEL[user.subscriptionStatus ?? ""] ?? user.subscriptionStatus ?? "Active")
                : "No active subscription"
            }
          />
          <Row
            label="Usage this period"
            value={
              subscribed
                ? `${entitlement.used} of ${entitlement.limit} analyses`
                : `${user.freeAnalysesUsed} of 1 free analysis used`
            }
          />
          {user.subscriptionStatus === "trialing" && (
            <Row label="Trial ends" value={fmtDate(user.trialEndsAt)} />
          )}
          {subscribed && (
            <Row
              label={user.cancelAtPeriodEnd ? "Access ends" : "Renews on"}
              value={fmtDate(user.currentPeriodEnd)}
            />
          )}
          {user.cancelAtPeriodEnd && (
            <Row label="Auto-renew" value="Off — will not renew" />
          )}
        </div>

        <div className="mt-6">
          <BillingActions hasSubscription={subscribed || !!user.stripeCustomerId} />
        </div>

        {!subscribed && (
          <div className="card mt-8 p-5">
            <p className="text-sm font-medium">Pro plan — $27/month</p>
            <p className="mt-1 text-sm text-muted">
              Starts with a <span className="font-medium text-ink">$1, 7-day trial</span>. Renews
              automatically at $27/month unless canceled. Cancel anytime before the renewal date
              from the billing portal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
