import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["shiki"],
  async rewrites() {
    return [{ source: "/__models.dev", destination: "https://models.dev/api.json" }]
  },
}

export default nextConfig
