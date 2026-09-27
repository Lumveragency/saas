"use client";

import { useState } from "react";
import { ScreenshotWorkspace } from "./ScreenshotWorkspace";
import { AnalyzeForm } from "@/components/AnalyzeForm";

export function Workspace({
  canAnalyze,
  examples,
  initialQuestion = "",
  autostart = false,
}: {
  canAnalyze: boolean;
  examples: string[];
  initialQuestion?: string;
  autostart?: boolean;
}) {
  // If a question was passed in (e.g. from the landing page), start in text mode.
  const [mode, setMode] = useState<"screenshot" | "text">(
    initialQuestion ? "text" : "screenshot",
  );

  return (
    <div>
      {mode === "screenshot" ? (
        <ScreenshotWorkspace canAnalyze={canAnalyze} />
      ) : (
        <AnalyzeForm
          canAnalyze={canAnalyze}
          examples={examples}
          initialQuestion={initialQuestion}
          autostart={autostart}
        />
      )}

      <div className="mt-6 text-center">
        {mode === "screenshot" ? (
          <button
            type="button"
            onClick={() => setMode("text")}
            className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            No screenshot? Type the question instead
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("screenshot")}
            className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            ← Back to screenshot upload
          </button>
        )}
      </div>
    </div>
  );
}
