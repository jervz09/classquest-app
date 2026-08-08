export const XP_RULES = { correctAnswer: 10, completion: 20, perfectBonus: 50 } as const;
export function calculateXp(correct: number, total: number) { if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 0 || correct < 0 || correct > total) throw new RangeError("Invalid quiz totals"); return correct * XP_RULES.correctAnswer + XP_RULES.completion + (total > 0 && correct === total ? XP_RULES.perfectBonus : 0); }
export function xpForLevel(level: number) { if (!Number.isInteger(level) || level < 1) throw new RangeError("Level must be positive"); return level === 1 ? 0 : 100 * (level - 1) ** 2; }
export function levelForXp(xp: number) { if (!Number.isFinite(xp) || xp < 0) throw new RangeError("XP must be non-negative"); return Math.floor(Math.sqrt(xp / 100)) + 1; }
