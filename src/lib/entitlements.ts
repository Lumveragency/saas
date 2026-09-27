import "server-only";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import type { SessionUser } from "@/lib/auth";

export type PlanId = "free" | "pro" | "scale";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  priceLabel: string;
  monthlyLimit: number; // analyses per billing month
  features: string[];
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    monthlyLimit: 1,
    features: ["One research report", "Full evidence & sources", "Report history"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceLabel: "$27/mo",
    monthlyLimit: config.limits.proMonthly,
    features: [
      `${config.limits.proMonthly} research reports / month`,
      "Full research reports",
      "Source links & methodology",
      "Forecast history",
      "Access to new features",
    ],
  },
  scale: {
    id: "scale",
    name: "Scale",
    priceLabel: "$79/mo",
    monthlyLimit: config.limits.scaleMonthly,
    features: [
      `${config.limits.scaleMonthly} research reports / month`,
      "Everything in Pro",
      "Priority research queue",
      "Early access to new research categories",
    ],
  },
};

/** A subscriber is anyone with an active or trialing paid plan. */
export function isSubscriber(user: SessionUser): boolean {
  if (user.plan === "free") return false;
  return (
    user.subscriptionStatus === "active" ||
    user.subscriptionStatus === "trialing"
  );
}

export function planFor(user: SessionUser): PlanDefinition {
  if (isSubscriber(user) && (user.plan === "pro" || user.plan === "scale")) {
    return PLANS[user.plan as PlanId];
  }
  return PLANS.free;
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export type Entitlement = {
  canAnalyze: boolean;
  reason: "ok" | "free_used" | "monthly_limit" | "inactive";
  used: number;
  limit: number;
  plan: PlanDefinition;
  isSubscriber: boolean;
};

/**
 * Server-side entitlement check. This is the single source of truth for
 * whether a user is allowed to run a new analysis. Never trust the client.
 */
export async function getEntitlement(user: SessionUser): Promise<Entitlement> {
  const subscriber = isSubscriber(user);
  const plan = planFor(user);

  if (!subscriber) {
    // Free tier: exactly one lifetime analysis (only successful ones count).
    const used = user.freeAnalysesUsed;
    return {
      canAnalyze: used < PLANS.free.monthlyLimit,
      reason: used < PLANS.free.monthlyLimit ? "ok" : "free_used",
      used,
      limit: PLANS.free.monthlyLimit,
      plan: PLANS.free,
      isSubscriber: false,
    };
  }

  // Subscribers: count analyses in the current calendar month.
  const used = await prisma.forecast.count({
    where: {
      userId: user.id,
      createdAt: { gte: startOfMonth() },
      status: { in: ["complete", "researching", "pending", "insufficient_evidence"] },
    },
  });

  return {
    canAnalyze: used < plan.monthlyLimit,
    reason: used < plan.monthlyLimit ? "ok" : "monthly_limit",
    used,
    limit: plan.monthlyLimit,
    plan,
    isSubscriber: true,
  };
}
