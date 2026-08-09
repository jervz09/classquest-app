import { describe, expect, it } from "vitest";
import { questionSchema, quizSchema } from "./quiz";

describe("quiz validation", () => {
  it("accepts supported metadata and rejects future game modes", () => {
    expect(quizSchema.safeParse({ title: "Solar System", difficulty: "easy", gameMode: "classic" }).success).toBe(true);
    expect(quizSchema.safeParse({ title: "Solar System", difficulty: "easy", gameMode: "boss_battle" }).success).toBe(false);
  });
  it("requires a multiple-choice answer to match a choice", () => {
    const base = { questionType: "multiple_choice", questionText: "Closest planet?", points: "10", choice1: "Venus", choice2: "Mercury" };
    expect(questionSchema.safeParse({ ...base, correctAnswer: "Mercury" }).success).toBe(true);
    expect(questionSchema.safeParse({ ...base, correctAnswer: "Earth" }).success).toBe(false);
  });
});
