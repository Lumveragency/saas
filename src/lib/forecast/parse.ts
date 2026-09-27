import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, extractJsonObject, estimateCostCents } from "./client";
import { config } from "@/lib/config";
import { ParseResultSchema, type ParseResult } from "./schema";

const PARSE_SYSTEM = `You are the question-parsing stage of a forecasting research pipeline.
Your only job is to interpret a user's future-event question and decide whether it is forecastable as a clear YES/NO outcome.

A question is FORECASTABLE only when ALL of these hold:
- It concerns a future event (something that has not yet definitively resolved).
- It has, or clearly implies, a specific resolution deadline or timeframe.
- It has an outcome that can be judged YES or NO by a reasonable observer.

If the question is missing a clear deadline, is too vague, is not about the future, asks for an opinion, or could resolve in many incomparable ways, it is NOT forecastable — return a single, specific clarifying question.

Do NOT invent missing dates, definitions, or assumptions. If a date is missing, ask for it rather than guessing.

Respond with ONLY a JSON object (no prose, no code fences) in exactly this shape:
{
  "forecastable": boolean,
  "clarification": string,        // required only when forecastable is false; a single specific question
  "parsed": {                      // required only when forecastable is true
    "originalQuestion": string,
    "event": string,               // the specific event being forecast
    "deadline": string,            // the resolution date/timeframe, as stated or clearly implied
    "yesDefinition": string,       // what must happen for YES
    "noDefinition": string,        // what counts as NO
    "assumptions": string[]        // explicit assumptions a reader should know (may be empty)
  }
}`;

export type ParseOutcome = {
  result: ParseResult;
  costCents: number;
};

export async function parseQuestion(question: string): Promise<ParseOutcome> {
  const client = getAnthropic();
  const model = config.anthropic.parserModel;

  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    system: PARSE_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Question: ${question}\n\nToday's date: ${new Date().toISOString().slice(0, 10)}`,
      },
    ],
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const raw = extractJsonObject(text);
  const result = ParseResultSchema.parse(raw);
  // Always keep the user's original question verbatim.
  if (result.parsed) result.parsed.originalQuestion = question;

  return {
    result,
    costCents: estimateCostCents(model, message.usage, 0),
  };
}
