import { DocsLayout } from "fumadocs-ui/layouts/docs"
import Image from "next/image"
import { source } from "@/lib/source"

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <DocsLayout
      tree={source.pageTree}
      githubUrl="https://github.com/andreastande/ai-sdk-token-usage"
      links={[]}
      nav={{
        title: (
          <>
            <Image src="/logo.png" alt="Logo" width={24} height={24} />
            AI SDK Token Usage
          </>
        ),
      }}
    >
      {children}
    </DocsLayout>
  )
}
