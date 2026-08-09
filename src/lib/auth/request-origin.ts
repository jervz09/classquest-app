export function resolveTrustedOrigin({ origin, forwardedHost, host, forwardedProto }: {
  origin: string | null;
  forwardedHost: string | null;
  host: string | null;
  forwardedProto: string | null;
}) {
  if (!origin) return null;
  try {
    const parsed = new URL(origin);
    const expectedHost = (forwardedHost?.split(",")[0] ?? host)?.trim();
    const expectedProtocol = forwardedProto?.split(",")[0]?.trim();
    if (!expectedHost || parsed.host !== expectedHost) return null;
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (expectedProtocol && parsed.protocol !== `${expectedProtocol}:`) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}
