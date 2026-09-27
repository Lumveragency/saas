import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const patchSchema = z.object({ saved: z.boolean() });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const record = await prisma.forecast.findUnique({ where: { id } });
  if (!record || record.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (record.status !== "complete") {
    return NextResponse.json(
      { error: "Only completed reports can be saved." },
      { status: 400 },
    );
  }

  await prisma.forecast.update({
    where: { id },
    data: { saved: parsed.data.saved },
  });

  return NextResponse.json({ ok: true, saved: parsed.data.saved });
}
