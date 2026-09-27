import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/validation";
import { config } from "@/lib/config";
import { extractFromImage, isAllowedMediaType } from "@/lib/forecast/extract";
import { ForecastConfigError } from "@/lib/forecast/client";

export const maxDuration = 60;

const bodySchema = z.object({
  // A data URL: data:image/png;base64,XXXX
  image: z.string().startsWith("data:image/"),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const rl = rateLimit(`extract:${user.id}`, 12, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many uploads — please wait a few seconds." },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "No valid image provided." }, { status: 400 });
  }

  const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/s.exec(parsed.data.image);
  if (!match) {
    return NextResponse.json({ error: "Unsupported image encoding." }, { status: 400 });
  }
  const mediaType = match[1];
  const base64 = match[2];

  if (!isAllowedMediaType(mediaType)) {
    return NextResponse.json(
      { error: "Please upload a PNG, JPEG, WebP, or GIF image." },
      { status: 400 },
    );
  }

  // Approximate decoded size from base64 length.
  const approxBytes = Math.floor((base64.length * 3) / 4);
  if (approxBytes > config.limits.maxImageBytes) {
    return NextResponse.json(
      { error: "That image is too large. Please upload one under 6 MB." },
      { status: 413 },
    );
  }

  try {
    const { extraction } = await extractFromImage(base64, mediaType);
    return NextResponse.json({ extraction });
  } catch (err) {
    const isConfig = err instanceof ForecastConfigError;
    console.error("Extraction error:", err);
    return NextResponse.json(
      {
        error: isConfig
          ? (err as Error).message
          : "We couldn't read that screenshot. Try a clearer image.",
      },
      { status: isConfig ? 503 : 500 },
    );
  }
}
