import { z } from "zod";

// ---------------------------------------------------------------------------
// Structured internal forecast response.
// The research engine must produce data conforming to these schemas; the
// output is validated before it is ever stored or shown to a user.
// ---------------------------------------------------------------------------

export const SourceSchema = z.object({
  title: z.string().min(1).max(300),
  url: z.string().url(),
  publisher: z.string().max(200).optional(),
  publishedDate: z.string().max(40).optional(),
});
export type Source = z.infer<typeof SourceSchema>;

export const EvidenceSchema = z.object({
  title: z.string().min(1).max(200),
  explanation: z.string().min(1).max(1200),
  // Index into the sources array (0-based), when a source backs this item.
  sourceIndex: z.number().int().min(0).optional(),
  publishedDate: z.string().max(40).optional(),
  // Rough strength of this individual piece of evidence.
  strength: z.enum(["weak", "moderate", "strong"]).optional(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const ChangeFactorSchema = z.object({
  title: z.string().min(1).max(200),
  detail: z.string().min(1).max(800),
  // Optional expected date of the development (free text, e.g. "Q1 2026").
  expected: z.string().max(60).optional(),
});
export type ChangeFactor = z.infer<typeof ChangeFactorSchema>;

export const ParsedQuestionSchema = z.object({
  originalQuestion: z.string().min(1),
  event: z.string().min(1).max(400),
  deadline: z.string().max(120),
  yesDefinition: z.string().min(1).max(600),
  noDefinition: z.string().min(1).max(600),
  assumptions: z.array(z.string().max(400)).max(8).default([]),
});
export type ParsedQuestion = z.infer<typeof ParsedQuestionSchema>;

// Output of the parsing stage: either forecastable, or needs clarification.
export const ParseResultSchema = z.object({
  forecastable: z.boolean(),
  // Present when forecastable is false: a specific question to the user.
  clarification: z.string().max(600).optional(),
  parsed: ParsedQuestionSchema.optional(),
});
export type ParseResult = z.infer<typeof ParseResultSchema>;

export const ForecastSchema = z
  .object({
    question: z.string().min(1),
    // 0..100 inclusive; validated for internal consistency below.
    yesProbability: z.number().int().min(0).max(100),
    noProbability: z.number().int().min(0).max(100),
    confidence: z.enum(["low", "medium", "high", "insufficient"]),
    summary: z.string().min(1).max(2400),
    supportingEvidence: z.array(EvidenceSchema).max(6).default([]),
    contraryEvidence: z.array(EvidenceSchema).max(6).default([]),
    keyUncertainty: z.string().max(1200).default(""),
    whatCouldChange: z.array(ChangeFactorSchema).max(6).default([]),
    sources: z.array(SourceSchema).max(20).default([]),
    assumptions: z.array(z.string().max(400)).max(8).default([]),
    methodology: z.object({
      interpretation: z.string().max(1600).default(""),
      researchApproach: z.string().max(1600).default(""),
      limitations: z.string().max(1600).default(""),
    }),
  })
  .refine((f) => Math.abs(f.yesProbability + f.noProbability - 100) <= 1, {
    message: "yesProbability and noProbability must sum to 100",
    path: ["noProbability"],
  });

export type Forecast = z.infer<typeof ForecastSchema>;

/**
 * Normalizes and validates a raw forecast object produced by the model.
 * Snaps probabilities so they sum to exactly 100 and clamps evidence source
 * indices to the available sources.
 */
export function normalizeForecast(raw: unknown): Forecast {
  const parsed = ForecastSchema.parse(raw);

  // Snap probabilities to sum to exactly 100.
  let yes = parsed.yesProbability;
  let no = 100 - yes;
  if (parsed.confidence === "insufficient") {
    // Insufficient evidence: present as an honest 50/50 without false precision.
    yes = 50;
    no = 50;
  }

  const cleanEvidence = (items: Evidence[]) =>
    items
      .map((e) =>
        e.sourceIndex !== undefined && e.sourceIndex >= parsed.sources.length
          ? { ...e, sourceIndex: undefined }
          : e,
      );

  return {
    ...parsed,
    yesProbability: yes,
    noProbability: no,
    supportingEvidence: cleanEvidence(parsed.supportingEvidence),
    contraryEvidence: cleanEvidence(parsed.contraryEvidence),
  };
}
