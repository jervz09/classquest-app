import { describe, expect, it } from "vitest";
import { quizAnswersSchema } from "./game";

describe("quizAnswersSchema", () => {
  it("accepts question UUIDs with selected answers", () => {
    expect(quizAnswersSchema.safeParse({ "59eda120-1ab0-4dc7-9705-86bbc0ebb967": "8" }).success).toBe(true);
  });

  it("rejects empty and malformed submissions", () => {
    expect(quizAnswersSchema.safeParse({}).success).toBe(false);
    expect(quizAnswersSchema.safeParse({ question: "" }).success).toBe(false);
  });
});
