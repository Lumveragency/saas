"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

type IconProps = { className?: string };

const Icons = {
  plus: (p: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" className={p.className} aria-hidden>
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  clock: (p: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" className={p.className} aria-hidden>
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3l2 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bookmark: (p: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" className={p.className} aria-hidden>
      <path d="M4 3.25h8v9.5L8 10.2l-4 2.55v-9.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  gear: (p: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" className={p.className} aria-hidden>
      <circle cx="8" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5v1.6M8 12.9v1.6M14.5 8h-1.6M3.1 8H1.5M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5 3.4 3.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  card: (p: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" className={p.className} aria-hidden>
      <rect x="2.25" y="4" width="11.5" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 6.75h11" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
};

export type NavItem = { href: string; label: string; icon: keyof typeof Icons };

const NAV: NavItem[] = [
  { href: "/app/history", label: "History", icon: "clock" },
  { href: "/app/saved", label: "Saved reports", icon: "bookmark" },
  { href: "/app/settings", label: "Account settings", icon: "gear" },
  { href: "/app/billing", label: "Subscription", icon: "card" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = Icons[item.icon];
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-muted hover:bg-black/[0.03] hover:text-ink"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function UsageBadge({ usageLabel }: { usageLabel: string }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted">Usage</div>
      <div className="mt-0.5 text-sm font-medium tabular-nums text-ink">{usageLabel}</div>
    </div>
  );
}

type ShellProps = {
  email: string;
  planName: string;
  usageLabel: string;
};

export function AppSidebar({ email, planName, usageLabel }: ShellProps) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="px-5 py-5">
        <Logo href="/app" />
      </div>

      <div className="px-3">
        <Link
          href="/app"
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
            isActive(pathname, "/app")
              ? "bg-accent text-white"
              : "bg-accent text-white hover:bg-accent-hover"
          }`}
        >
          <Icons.plus className="h-4 w-4" />
          New research
        </Link>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="space-y-3 border-t border-line p-3">
        <UsageBadge usageLabel={usageLabel} />
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-ink">{email}</div>
            <div className="text-[11px] text-muted">{planName} plan</div>
          </div>
        </div>
        <SignOut />
      </div>
    </aside>
  );
}

export function AppMobileBar({ email, planName, usageLabel }: ShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Logo href="/app" />
        <div className="flex items-center gap-2">
          <Link href="/app" className="btn-primary px-3 py-1.5 text-xs">
            <Icons.plus className="h-3.5 w-3.5" /> New
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
              <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line px-3 py-3">
          <nav className="space-y-1">
            {NAV.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />
            ))}
          </nav>
          <div className="mt-3 space-y-3 border-t border-line pt-3">
            <UsageBadge usageLabel={usageLabel} />
            <div className="px-1 text-xs text-muted">
              {email} · {planName} plan
            </div>
            <SignOut />
          </div>
        </div>
      )}
    </header>
  );
}

function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="w-full rounded-lg border border-line px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
