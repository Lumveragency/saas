import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteNav({ authed }: { authed: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/#how-it-works" className="text-sm text-muted hover:text-ink">
            How it works
          </Link>
          <Link href="/pricing" className="text-sm text-muted hover:text-ink">
            Pricing
          </Link>
          <Link href="/#faq" className="text-sm text-muted hover:text-ink">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {authed ? (
            <Link href="/app" className="btn-primary">
              Open app
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
