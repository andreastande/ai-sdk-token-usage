import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { baseOptions } from "@/lib/layout.shared"
import { source } from "@/lib/source"

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      tree={source.pageTree}
      githubUrl="https://github.com/andreastande/ai-sdk-token-usage"
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  )
}
