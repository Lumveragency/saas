import { getCurrentUser } from "@/lib/auth";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PricingCards } from "@/components/marketing/PricingCards";

export const metadata = { title: "Pricing — MarketScan" };

export default async function PricingPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav authed={!!user} />
      <main className="flex-1">
        <section className="container-page py-16 sm:py-20">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Simple, honest pricing
            </h1>
            <p className="mt-3 text-[15px] text-muted">
              One free analysis to try it. Pro starts with a $1, 7-day trial, then $27/month.
              Cancel anytime.
            </p>
          </div>
          <div className="mt-12">
            <PricingCards authed={!!user} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
