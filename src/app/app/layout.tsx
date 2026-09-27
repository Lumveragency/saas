import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getEntitlement } from "@/lib/entitlements";
import { AppSidebar, AppMobileBar } from "@/components/app/AppSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const entitlement = await getEntitlement(user);
  const remaining = Math.max(entitlement.limit - entitlement.used, 0);
  const usageLabel = entitlement.isSubscriber
    ? `${remaining} of ${entitlement.limit} left`
    : entitlement.canAnalyze
      ? "1 free analysis"
      : "Free analysis used";

  const shell = {
    email: user.email,
    planName: entitlement.plan.name,
    usageLabel,
  };

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <AppSidebar {...shell} />
      <div className="min-w-0 flex-1">
        <AppMobileBar {...shell} />
        <main>{children}</main>
      </div>
    </div>
  );
}
