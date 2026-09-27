import "server-only";
import { parseQuestion } from "./parse";
import { researchAndForecast } from "./research";
import type { Forecast, ParsedQuestion } from "./schema";

export type ScreenshotInput = {
  question: string;
  yesDefinition?: string;
  noDefinition?: string;
  deadline?: string;
  marketImpliedYes?: number | null;
};

export type ScreenshotForecast = {
  parsed: ParsedQuestion;
  forecast: Forecast;
  costCents: number;
  webSearchCount: number;
};

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

/**
 * Screenshot path: the question and outcomes were already extracted from an
 * image and confirmed by the user, so we skip the text-parsing stage and go
 * straight to research + forecast.
 */
export async function runScreenshotPipeline(
  input: ScreenshotInput,
): Promise<ScreenshotForecast> {
  const parsed: ParsedQuestion = {
    originalQuestion: input.question,
    event: input.question,
    deadline: input.deadline?.trim() || "as specified in the question",
    yesDefinition:
      input.yesDefinition?.trim() || "The event described in the question occurs.",
    noDefinition:
      input.noDefinition?.trim() ||
      "The event described in the question does not occur by the deadline.",
    assumptions: [],
  };

  const research = await researchAndForecast(parsed, {
    marketImpliedYes: input.marketImpliedYes ?? null,
  });

  return {
    parsed,
    forecast: research.forecast,
    costCents: research.costCents,
    webSearchCount: research.webSearchCount,
  };
}
