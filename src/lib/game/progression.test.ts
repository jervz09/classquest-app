import { describe, expect, it } from "vitest";
import { calculateXp, levelForXp, xpForLevel } from "./progression";
describe("progression", () => {
  it("awards answer, completion, and perfect XP", () => { expect(calculateXp(3, 5)).toBe(50); expect(calculateXp(5, 5)).toBe(120); });
  it("uses square level thresholds", () => { expect(xpForLevel(2)).toBe(100); expect(xpForLevel(3)).toBe(400); expect(levelForXp(399)).toBe(2); expect(levelForXp(400)).toBe(3); });
});
