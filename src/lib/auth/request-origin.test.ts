import { describe, expect, it } from "vitest";
import { resolveTrustedOrigin } from "./request-origin";

describe("resolveTrustedOrigin", () => {
  it("accepts an origin matching the forwarded host and protocol", () => {
    expect(resolveTrustedOrigin({ origin: "https://classquest.example", forwardedHost: "classquest.example", host: "internal:3000", forwardedProto: "https" })).toBe("https://classquest.example");
  });

  it("supports localhost without proxy headers", () => {
    expect(resolveTrustedOrigin({ origin: "http://localhost:3000", forwardedHost: null, host: "localhost:3000", forwardedProto: null })).toBe("http://localhost:3000");
  });

  it("rejects spoofed, malformed, and non-http origins", () => {
    expect(resolveTrustedOrigin({ origin: "https://evil.example", forwardedHost: "classquest.example", host: null, forwardedProto: "https" })).toBeNull();
    expect(resolveTrustedOrigin({ origin: "not a URL", forwardedHost: "classquest.example", host: null, forwardedProto: "https" })).toBeNull();
    expect(resolveTrustedOrigin({ origin: "javascript:alert(1)", forwardedHost: "", host: "", forwardedProto: null })).toBeNull();
  });
});
