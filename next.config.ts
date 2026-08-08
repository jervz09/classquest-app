import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The compiler API avoids spawning a detached tsc process in restricted CI runners.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
