import type { Top10Scores } from "@/lib/types";

/** PawPicks Score weights — must sum to 1. Shown verbatim on every article. */
export const SCORE_WEIGHTS = [
  { key: "quality", label: "คุณภาพและความปลอดภัย", weight: 0.25 },
  { key: "features", label: "คุณสมบัติและประโยชน์", weight: 0.2 },
  { key: "value", label: "ความคุ้มค่า", weight: 0.2 },
  { key: "reviews", label: "คะแนนและจำนวนรีวิว", weight: 0.15 },
  { key: "storeTrust", label: "ความน่าเชื่อถือของร้าน", weight: 0.1 },
  { key: "warranty", label: "การรับประกันและบริการ", weight: 0.1 },
] as const satisfies readonly { key: keyof Top10Scores; label: string; weight: number }[];

/** Weighted PawPicks Score (0–100, one decimal), or null when inputs are missing. */
export function computePawPicksScore(scores: Top10Scores | undefined): number | null {
  if (!scores) return null;
  const total = SCORE_WEIGHTS.reduce((sum, w) => sum + scores[w.key] * w.weight, 0);
  return Math.round(total * 10) / 10;
}
