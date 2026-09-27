import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "./SignOutButton";

export function AppNav({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo href="/app" />
          <nav className="hidden items-center gap-6 sm:flex">
            <Link href="/app" className="text-sm text-muted hover:text-ink">New analysis</Link>
            <Link href="/app/history" className="text-sm text-muted hover:text-ink">History</Link>
            <Link href="/app/billing" className="text-sm text-muted hover:text-ink">Billing</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[180px] truncate text-xs text-muted sm:inline">
            {email}
          </span>
          <SignOutButton />
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="container-page flex items-center gap-5 border-t border-line py-2.5 sm:hidden">
        <Link href="/app" className="text-sm text-muted">New</Link>
        <Link href="/app/history" className="text-sm text-muted">History</Link>
        <Link href="/app/billing" className="text-sm text-muted">Billing</Link>
      </nav>
    </header>
  );
}
