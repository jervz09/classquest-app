"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en"><body><main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", fontFamily: "system-ui, sans-serif" }}><section style={{ maxWidth: "480px", textAlign: "center" }}><h1>ClassQuest is temporarily unavailable</h1><p>Please retry the request. If the problem continues, return in a few minutes.</p><button type="button" onClick={reset} style={{ marginTop: "16px", padding: "10px 16px", cursor: "pointer" }}>Try again</button></section></main></body></html>
  );
}
