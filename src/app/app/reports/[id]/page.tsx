import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ForecastSchema } from "@/lib/forecast/schema";
import { ForecastReport } from "@/components/forecast/ForecastReport";

export const metadata = { title: "Forecast report — MarketScan" };

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { id } = await params;

  const record = await prisma.forecast.findUnique({ where: { id } });
  if (!record || record.userId !== user.id) notFound();

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between text-sm">
          <Link href="/app/history" className="text-muted hover:text-ink">
            ← All reports
          </Link>
          <span className="text-xs text-muted">
            {new Date(record.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {record.status === "complete" && record.result ? (
          <ReportBody json={record.result} question={record.question} />
        ) : record.status === "needs_clarification" ? (
          <StatusCard
            tone="amber"
            title="This question needs clarification"
            body={record.clarification ?? "Please refine the question and try again."}
            question={record.question}
          />
        ) : record.status === "error" ? (
          <StatusCard
            tone="red"
            title="Analysis could not be completed"
            body={record.errorMessage ?? "Something went wrong."}
            question={record.question}
          />
        ) : (
          <StatusCard
            tone="neutral"
            title="Analysis in progress"
            body="This report is still being generated. Refresh in a moment."
            question={record.question}
          />
        )}
      </div>
    </div>
  );
}

function ReportBody({ json, question }: { json: string; question: string }) {
  const parsed = ForecastSchema.safeParse(JSON.parse(json));
  if (!parsed.success) {
    return (
      <StatusCard
        tone="red"
        title="Report could not be displayed"
        body="The stored forecast was in an unexpected format."
        question={question}
      />
    );
  }
  return <ForecastReport forecast={parsed.data} />;
}

function StatusCard({
  tone,
  title,
  body,
  question,
}: {
  tone: "amber" | "red" | "neutral";
  title: string;
  body: string;
  question: string;
}) {
  const border =
    tone === "amber"
      ? "border-l-amber-400"
      : tone === "red"
        ? "border-l-negative"
        : "border-l-accent";
  return (
    <div>
      <p className="text-sm text-muted">Question</p>
      <h1 className="mt-1 text-xl font-semibold leading-snug">{question}</h1>
      <div className={`card mt-6 border-l-2 p-5 ${border}`}>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted">{body}</p>
        <Link href="/app" className="btn-secondary mt-4">
          Start a new analysis
        </Link>
      </div>
    </div>
  );
}
