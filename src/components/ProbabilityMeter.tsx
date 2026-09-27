type Props = {
  yes: number;
  no: number;
  confidence: "low" | "medium" | "high" | "insufficient";
  size?: "lg" | "sm";
};

const CONFIDENCE_LABEL: Record<Props["confidence"], string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
  insufficient: "Insufficient evidence",
};

export function ProbabilityMeter({ yes, no, confidence, size = "lg" }: Props) {
  const insufficient = confidence === "insufficient";
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Estimated likelihood — YES</div>
          <div
            className={
              size === "lg"
                ? "mt-1 text-6xl font-semibold tabular-nums tracking-[-0.03em]"
                : "mt-1 text-3xl font-semibold tabular-nums tracking-[-0.02em]"
            }
          >
            {insufficient ? "—" : `${yes}%`}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted">NO</div>
          <div className="text-lg font-medium tabular-nums text-muted">
            {insufficient ? "—" : `${no}%`}
          </div>
        </div>
      </div>

      <div
        className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-line"
        role="img"
        aria-label={
          insufficient
            ? "Insufficient evidence to estimate a probability"
            : `Estimated ${yes} percent yes, ${no} percent no`
        }
      >
        {!insufficient && (
          <>
            <div className="h-full rounded-l-full bg-accent" style={{ width: `${yes}%` }} />
            <div className="h-full bg-line" style={{ width: `${no}%` }} />
          </>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            confidence === "high"
              ? "bg-positive"
              : confidence === "medium"
                ? "bg-accent"
                : confidence === "low"
                  ? "bg-amber-500"
                  : "bg-muted"
          }`}
        />
        <span className="text-xs font-medium text-muted">
          {CONFIDENCE_LABEL[confidence]}
        </span>
      </div>
    </div>
  );
}
