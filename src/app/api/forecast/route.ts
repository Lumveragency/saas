import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getEntitlement } from "@/lib/entitlements";
import { questionSchema, rateLimit } from "@/lib/validation";
import { runPipeline, runScreenshotPipeline } from "@/lib/forecast/engine";
import { ForecastConfigError } from "@/lib/forecast/client";

// The research pipeline performs web search + model inference; allow headroom.
export const maxDuration = 120;

const screenshotSchema = z.object({
  source: z.literal("screenshot"),
  question: questionSchema,
  yesDefinition: z.string().max(600).optional(),
  noDefinition: z.string().max(600).optional(),
  deadline: z.string().max(120).optional(),
  platform: z.string().max(80).optional(),
  marketImpliedYes: z.number().int().min(0).max(100).nullable().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Per-user rate limit: guards against runaway cost and abuse.
  const rl = rateLimit(`forecast:${user.id}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "You're going quickly — please wait a few seconds and retry." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);

  // Two entry paths: screenshot-confirmed, or plain text question.
  const isScreenshot = body?.source === "screenshot";
  let question: string;
  let screenshot: z.infer<typeof screenshotSchema> | null = null;

  if (isScreenshot) {
    const parsed = screenshotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid screenshot data." },
        { status: 400 },
      );
    }
    screenshot = parsed.data;
    question = parsed.data.question;
  } else {
    const parsed = questionSchema.safeParse(body?.question);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid question." },
        { status: 400 },
      );
    }
    question = parsed.data;
  }

  // Entitlement gate — the single source of truth, checked server-side.
  const entitlement = await getEntitlement(user);
  if (!entitlement.canAnalyze) {
    return NextResponse.json(
      {
        error:
          entitlement.reason === "free_used"
            ? "You've used your free analysis. Subscribe to continue."
            : "You've reached your monthly analysis limit.",
        reason: entitlement.reason,
      },
      { status: 402 },
    );
  }

  // Duplicate protection: reuse a recent identical completed report so the
  // user isn't charged research cost twice.
  const dupe = await prisma.forecast.findFirst({
    where: {
      userId: user.id,
      question,
      status: "complete",
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (dupe) {
    return NextResponse.json({ id: dupe.id, status: "complete", reused: true });
  }

  const record = await prisma.forecast.create({
    data: {
      userId: user.id,
      question,
      status: "researching",
      source: isScreenshot ? "screenshot" : "text",
      platform: screenshot?.platform ?? null,
      marketImpliedYes: screenshot?.marketImpliedYes ?? null,
    },
  });

  try {
    if (isScreenshot && screenshot) {
      const result = await runScreenshotPipeline({
        question: screenshot.question,
        yesDefinition: screenshot.yesDefinition,
        noDefinition: screenshot.noDefinition,
        deadline: screenshot.deadline,
        marketImpliedYes: screenshot.marketImpliedYes ?? null,
      });
      await finalizeComplete(record.id, result, user, entitlement.isSubscriber);
      return NextResponse.json({ id: record.id, status: "complete" });
    }

    const result = await runPipeline(question);
    if (result.kind === "clarification") {
      await prisma.forecast.update({
        where: { id: record.id },
        data: {
          status: "needs_clarification",
          clarification: result.clarification,
          estimatedCostCents: result.costCents,
        },
      });
      return NextResponse.json({
        id: record.id,
        status: "needs_clarification",
        clarification: result.clarification,
      });
    }

    await finalizeComplete(record.id, result, user, entitlement.isSubscriber);
    return NextResponse.json({ id: record.id, status: "complete" });
  } catch (err) {
    const isConfig = err instanceof ForecastConfigError;
    const message = isConfig
      ? (err as Error).message
      : "The analysis could not be completed. Please try again.";
    await prisma.forecast.update({
      where: { id: record.id },
      data: { status: "error", errorMessage: message },
    });
    console.error("Forecast pipeline error:", err);
    return NextResponse.json(
      { id: record.id, status: "error", error: message },
      { status: isConfig ? 503 : 500 },
    );
  }
}

type CompleteResult = {
  parsed: unknown;
  forecast: {
    yesProbability: number;
    confidence: string;
  };
  costCents: number;
  webSearchCount: number;
};

async function finalizeComplete(
  recordId: string,
  result: CompleteResult,
  user: { id: string },
  isSubscriber: boolean,
): Promise<void> {
  await prisma.forecast.update({
    where: { id: recordId },
    data: {
      status: "complete",
      parsed: JSON.stringify(result.parsed),
      result: JSON.stringify(result.forecast),
      yesProbability: result.forecast.yesProbability,
      confidence: result.forecast.confidence,
      estimatedCostCents: result.costCents,
      webSearchCount: result.webSearchCount,
    },
  });

  // Only a completed forecast consumes the free-tier allowance.
  if (!isSubscriber) {
    await prisma.user.update({
      where: { id: user.id },
      data: { freeAnalysesUsed: { increment: 1 } },
    });
  }
}
