"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ ok: true, text: "Password updated." });
        setCurrent("");
        setNext("");
      } else {
        setMsg({ ok: false, text: data.error ?? "Could not update password." });
      }
    } catch {
      setMsg({ ok: false, text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="current" className="label">Current password</label>
        <input
          id="current"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="input max-w-sm"
        />
      </div>
      <div>
        <label htmlFor="next" className="label">New password</label>
        <input
          id="next"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="input max-w-sm"
          placeholder="At least 8 characters"
        />
      </div>
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-positive" : "text-negative"}`}>{msg.text}</p>
      )}
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
