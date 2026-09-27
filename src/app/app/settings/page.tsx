import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getEntitlement } from "@/lib/entitlements";
import { ChangePasswordForm } from "@/components/app/ChangePasswordForm";

export const metadata = { title: "Account settings — MarketScan" };

export default async function SettingsPage() {
  const user = (await getCurrentUser())!;
  const entitlement = await getEntitlement(user);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <h1 className="text-2xl font-bold tracking-[-0.02em]">Account settings</h1>
      <p className="mt-1 text-sm text-muted">Manage your account and security.</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Account</h2>
        <div className="card mt-3 divide-y divide-line">
          <Row label="Email" value={user.email} />
          <Row label="Plan" value={entitlement.plan.name} />
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-muted">Subscription</span>
            <Link href="/app/billing" className="text-sm font-medium text-accent hover:underline">
              Manage →
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Change password</h2>
        <div className="card mt-3 p-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm text-muted">{label}</span>
      <span className="max-w-[60%] truncate text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
