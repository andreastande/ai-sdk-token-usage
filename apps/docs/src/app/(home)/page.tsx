import { buttonVariants } from "fumadocs-ui/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/cn"

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col justify-center">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center px-6">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Understand your token usage with precision.
        </h1>
        <p className="mt-6 text-pretty text-lg text-fd-muted-foreground sm:text-xl">
          A lightweight TypeScript library for tracking and visualizing AI token usage across providers — with real-time
          cost insights and model-aware context windows.
        </p>

        <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/docs/overview"
            className={cn(
              buttonVariants({ variant: "primary" }),
              "group bg-fd-foreground hover:bg-fd-foreground/80 px-4 py-3",
            )}
          >
            Get Started
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
