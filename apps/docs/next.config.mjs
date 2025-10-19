import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  devIndicators: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/:path*.mdx",
        destination: "/llms.mdx/:path*",
      },
    ]
  },
}

export default withMDX(config)
