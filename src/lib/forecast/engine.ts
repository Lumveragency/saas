import "server-only";
import { parseQuestion } from "./parse";
import { researchAndForecast } from "./research";
import type { Forecast, ParsedQuestion } from "./schema";

export type PipelineResult =
  | {
      kind: "clarification";
      clarification: string;
      costCents: number;
    }
  | {
      kind: "forecast";
      parsed: ParsedQuestion;
      forecast: Forecast;
      costCents: number;
      webSearchCount: number;
    };

/**
 * Full forecasting pipeline:
 *   Stage 1 — parse & validate the question (may request clarification)
 *   Stage 2-4 — research, evaluate evidence, and generate a forecast.
 */
export async function runPipeline(question: string): Promise<PipelineResult> {
  const parse = await parseQuestion(question);

  if (!parse.result.forecastable || !parse.result.parsed) {
    return {
      kind: "clarification",
      clarification:
        parse.result.clarification ??
        "This question needs more detail before it can be forecast. Please specify the event and a resolution date.",
      costCents: parse.costCents,
    };
  }

  const research = await researchAndForecast(parse.result.parsed);

  return {
    kind: "forecast",
    parsed: parse.result.parsed,
    forecast: research.forecast,
    costCents: parse.costCents + research.costCents,
    webSearchCount: research.webSearchCount,
  };
}
