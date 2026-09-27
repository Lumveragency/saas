import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Create your account — MarketScan" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/app");
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
