"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SaveButton({
  id,
  initialSaved,
}: {
  id: string;
  initialSaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !saved;
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: next }),
      });
      if (res.ok) {
        setSaved(next);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={`btn ${
        saved ? "border border-accent bg-accent-soft text-accent" : "btn-secondary"
      } px-3.5 py-2 text-xs`}
    >
      <svg viewBox="0 0 16 16" fill={saved ? "currentColor" : "none"} className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M4 3.25h8v9.5L8 10.2l-4 2.55v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
