import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteNav({
  authed,
  onDark = false,
}: {
  authed: boolean;
  onDark?: boolean;
}) {
  const link = onDark
    ? "text-sm font-medium text-white/80 hover:text-white"
    : "text-sm text-muted hover:text-ink";

  return (
    <header
      className={
        onDark
          ? "absolute inset-x-0 top-0 z-40"
          : "sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur"
      }
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Logo tone={onDark ? "dark" : "light"} />
        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/#how-it-works" className={link}>How it works</Link>
          <Link href="/pricing" className={link}>Pricing</Link>
          <Link href="/#faq" className={link}>FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          {authed ? (
            <Link href="/app" className={onDark ? "btn-on-blue" : "btn-primary"}>
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={onDark ? "hidden text-sm font-medium text-white/80 hover:text-white sm:inline" : "btn-ghost"}
              >
                Sign in
              </Link>
              <Link href="/signup" className={onDark ? "btn-on-blue" : "btn-primary"}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
