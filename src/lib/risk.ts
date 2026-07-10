import type { Experience, SatisfactionEntry } from "@/lib/db/schema";
import { averageScore } from "@/lib/satisfaction";
import { listCompetencesWithUsage } from "@/lib/competences";

export type RiskLevel = "faible" | "modere" | "eleve";

export type RiskContext = {
  currentExperience: Experience | null;
  recentSatisfaction: SatisfactionEntry[]; // most recent first
  staleKeyCompetencesCount: number;
};

type RiskRule = (ctx: RiskContext) => string | null;

const TENURE_WARNING_MONTHS = 48;
const STALE_MONTHS = 12;
const LOW_SATISFACTION_THRESHOLD = 5;

function monthsSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

const longTenureRule: RiskRule = (ctx) => {
  if (!ctx.currentExperience) return null;
  const months = monthsSince(ctx.currentExperience.startDate);
  if (months >= TENURE_WARNING_MONTHS) {
    const years = Math.floor(months / 12);
    return `Ancienneté importante sur le poste actuel (${years} ans) — vaut le coup de vérifier que ça évolue toujours.`;
  }
  return null;
};

const decliningSatisfactionRule: RiskRule = (ctx) => {
  if (ctx.recentSatisfaction.length < 2) return null;
  const [latest, previous] = ctx.recentSatisfaction;
  if (averageScore(latest) < averageScore(previous) - 0.5) {
    return "Satisfaction en baisse par rapport au mois précédent.";
  }
  return null;
};

const lowSatisfactionRule: RiskRule = (ctx) => {
  if (ctx.recentSatisfaction.length === 0) return null;
  const latest = ctx.recentSatisfaction[0];
  if (averageScore(latest) < LOW_SATISFACTION_THRESHOLD) {
    return "Satisfaction actuelle faible (< 5/10 en moyenne).";
  }
  return null;
};

const staleCompetencesRule: RiskRule = (ctx) => {
  if (ctx.staleKeyCompetencesCount === 0) return null;
  return `${ctx.staleKeyCompetencesCount} compétence(s) clé(s) non utilisée(s) depuis plus d'un an.`;
};

const RULES: RiskRule[] = [longTenureRule, decliningSatisfactionRule, lowSatisfactionRule, staleCompetencesRule];

export function computeRiskLevel(ctx: RiskContext): { level: RiskLevel; reasons: string[] } {
  const reasons = RULES.map((rule) => rule(ctx)).filter((r): r is string => r !== null);
  const level: RiskLevel = reasons.length === 0 ? "faible" : reasons.length === 1 ? "modere" : "eleve";
  return { level, reasons };
}

export async function getStaleKeyCompetencesCount(): Promise<number> {
  const competences = await listCompetencesWithUsage();
  return competences.filter((c) => {
    if ((c.level ?? 0) < 3) return false;
    if (!c.lastUsed.date) return false;
    return monthsSince(c.lastUsed.date) >= STALE_MONTHS;
  }).length;
}
