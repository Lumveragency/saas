"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BillingActions({ hasSubscription }: { hasSubscription: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manage() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Could not open the billing portal.");
        setBusy(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      {hasSubscription ? (
        <button type="button" onClick={manage} disabled={busy} className="btn-secondary">
          {busy ? "Opening…" : "Manage billing & cancel"}
        </button>
      ) : (
        <button type="button" onClick={() => router.push("/pricing")} className="btn-primary">
          View plans
        </button>
      )}
      {error && <p className="mt-3 text-sm text-negative">{error}</p>}
      {hasSubscription && (
        <p className="mt-3 text-xs text-muted">
          Manage your payment method, view invoices, or cancel your subscription in the secure
          Stripe billing portal.
        </p>
      )}
    </div>
  );
}
