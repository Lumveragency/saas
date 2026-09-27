"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";
  const q = params.get("q");
  const next = params.get("next");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      const dest = q ? `/app?q=${encodeURIComponent(q)}` : (next ?? "/app");
      router.push(dest);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        {isSignup
          ? "Start with one free research report."
          : "Sign in to continue your research."}
      </p>

      {q && isSignup && (
        <div className="mt-5 rounded-lg border border-line bg-surface p-3 text-xs text-muted">
          We&apos;ll analyze this after you sign up:
          <p className="mt-1 font-medium text-ink">{q}</p>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
          />
        </div>
        {error && <p className="text-sm text-negative">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link
              href={q ? `/login?q=${encodeURIComponent(q)}` : "/login"}
              className="font-medium text-accent hover:underline"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to MarketScan?{" "}
            <Link
              href={q ? `/signup?q=${encodeURIComponent(q)}` : "/signup"}
              className="font-medium text-accent hover:underline"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
