import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import Image from "next/image"

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image src="/logo.png" alt="Logo" width={24} height={24} />
          AI SDK Token Usage
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [],
    githubUrl: "https://github.com/andreastande/ai-sdk-token-usage",
  }
}
