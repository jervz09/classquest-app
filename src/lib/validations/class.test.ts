import { describe, expect, it } from "vitest";
import { createClassSchema, joinClassSchema } from "./class";

describe("class validation", () => {
  it("normalizes safe human-readable join codes", () => {
    expect(joinClassSchema.parse({ code: " ab2xyz " }).code).toBe("AB2XYZ");
    expect(joinClassSchema.safeParse({ code: "AB10OI" }).success).toBe(false);
  });

  it("requires a meaningful class name", () => {
    expect(createClassSchema.safeParse({ name: "A" }).success).toBe(false);
    expect(createClassSchema.parse({ name: "  Biology  " }).name).toBe("Biology");
  });
});
