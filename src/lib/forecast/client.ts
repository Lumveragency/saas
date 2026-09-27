import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "@/lib/config";

export function getAnthropic(): Anthropic {
  if (!config.anthropic.apiKey) {
    throw new ForecastConfigError(
      "The research engine is not configured. Set ANTHROPIC_API_KEY to enable analyses.",
    );
  }
  return new Anthropic({ apiKey: config.anthropic.apiKey });
}

export class ForecastConfigError extends Error {}
export class ForecastEngineError extends Error {}

// Rough per-model pricing in USD per 1M tokens (input, output). Used only for
// internal cost tracking — never surfaced to end users.
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-opus-5": { input: 5, output: 25 },
};

const WEB_SEARCH_COST_PER_CALL_USD = 0.01; // ~$10 per 1,000 searches

type Usage = {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number | null;
  server_tool_use?: { web_search_requests?: number } | null;
};

export function estimateCostCents(
  model: string,
  usage: Usage | null | undefined,
  webSearchCount: number,
): number {
  const price = PRICING[model] ?? { input: 3, output: 15 };
  const inputTokens = usage?.input_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;
  const tokenCostUsd =
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output;
  const searchCostUsd = webSearchCount * WEB_SEARCH_COST_PER_CALL_USD;
  return Math.ceil((tokenCostUsd + searchCostUsd) * 100);
}

/** Extracts the first JSON object from a model text response. */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  // Strip common code fences.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new ForecastEngineError("Model did not return a JSON object.");
  }
  const jsonText = candidate.slice(start, end + 1);
  try {
    return JSON.parse(jsonText);
  } catch {
    throw new ForecastEngineError("Model returned malformed JSON.");
  }
}
