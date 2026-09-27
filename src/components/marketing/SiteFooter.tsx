import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted">
            MarketScan helps you research future events and understand uncertainty.
            Forecasts are AI-generated estimates, not guarantees or financial advice.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link href="/#how-it-works" className="hover:text-ink">How it works</Link>
          <Link href="/pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/#faq" className="hover:text-ink">FAQ</Link>
          <Link href="/login" className="hover:text-ink">Sign in</Link>
        </nav>
      </div>
      <div className="container-page border-t border-line py-5 text-xs text-muted">
        © {new Date().getFullYear()} MarketScan. For research and educational use only.
      </div>
    </footer>
  );
}
