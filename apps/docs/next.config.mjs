import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  devIndicators: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/docs/overview",
        permanent: true,
      },
    ]
  },
}

export default withMDX(config)
