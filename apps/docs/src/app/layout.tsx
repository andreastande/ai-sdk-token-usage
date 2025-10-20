import "@/app/global.css"
import { Analytics } from "@vercel/analytics/next"
import { RootProvider } from "fumadocs-ui/provider/next"
import { Inter } from "next/font/google"
import { baseUrl } from "@/lib/metadata"

export const metadata = {
  title: {
    template: "%s | AI SDK Token Usage",
    default: "AI SDK Token Usage",
  },
  description:
    "A lightweight Typescript framework, built for AI SDK and React, to track and visualize token usage across multiple AI model providers.",
  metadataBase: baseUrl,
}

const inter = Inter({
  subsets: ["latin"],
})

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          {children}
          <Analytics />
        </RootProvider>
      </body>
    </html>
  )
}
