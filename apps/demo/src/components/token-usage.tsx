import type { UIMessage } from "ai"
import { formatPrice, formatTokenAmount, type TokenUsageError, useTokenContext, useTokenCost } from "ai-sdk-token-usage"
import { AlertOctagon } from "lucide-react"
import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"
import { Progress } from "./ui/progress"
import { Skeleton } from "./ui/skeleton"
import "react-circular-progressbar/dist/styles.css"

interface TokenUsageProps {
  messages: UIMessage[]
  canonicalSlug: string
}

export default function TokenUsage({ messages, canonicalSlug }: TokenUsageProps) {
  // biome-ignore format: ignore
  const { data: context, isLoading: isContextLoading, error: contextError } = useTokenContext({ messages, canonicalSlug })
  const { data: cost, isLoading: isCostLoading, error: costError } = useTokenCost({ messages })

  const isLoading = isContextLoading || isCostLoading
  const isError = Boolean(contextError) || Boolean(costError)

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger>
        <TokenUsageTrigger percentageUsed={context?.percentageUsed ?? 0} isError={isError} />
      </HoverCardTrigger>

      <HoverCardContent className="overflow-hidden">
        <TokenUsageContent>
          <TokenUsageContext
            percentageUsed={context?.percentageUsed ?? 0}
            usedTokens={context?.used ?? 0}
            limitTokens={context?.limit ?? 0}
            isLoading={isLoading}
          />

          <Separator />

          <TokenUsageCostBreakdown
            rows={[
              {
                label: "Input",
                amount: cost?.breakdown.input.amount ?? 0,
                cost: cost?.breakdown.input.cost ?? 0,
              },
              {
                label: "Output",
                amount: cost?.breakdown.output.amount ?? 0,
                cost: cost?.breakdown.output.cost ?? 0,
              },
              {
                label: "Reasoning",
                amount: cost?.breakdown.reasoning.amount ?? 0,
                cost: cost?.breakdown.reasoning.cost ?? 0,
              },
              {
                label: "Cached input",
                amount: cost?.breakdown.cachedInput.amount ?? 0,
                cost: cost?.breakdown.cachedInput.cost ?? 0,
              },
            ]}
            isLoading={isLoading}
          />

          <Separator />

          <TokenUsageCostTotal total={cost?.total ?? 0} isLoading={isLoading} error={contextError ?? costError} />
        </TokenUsageContent>
      </HoverCardContent>
    </HoverCard>
  )
}

/* ───────────────────────────── Subcomponents ───────────────────────────── */

const TokenUsageTrigger = ({ percentageUsed, isError }: { percentageUsed: number; isError: boolean }) => (
  <CircularProgressbarWithChildren
    value={percentageUsed}
    styles={buildStyles({ pathColor: "var(--foreground)", trailColor: "var(--input)" })}
    className="size-7 hover:brightness-90"
  >
    {isError ? <span className="text-red-400 select-none">!</span> : null}
  </CircularProgressbarWithChildren>
)

const TokenUsageContent = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[12px] space-y-4">{children}</div>
)

const TokenUsageContext = ({
  percentageUsed,
  usedTokens,
  limitTokens,
  isLoading,
}: {
  percentageUsed: number
  usedTokens: number
  limitTokens: number
  isLoading: boolean
}) => (
  <div>
    <div className="flex justify-between mb-2 items-center">
      {isLoading ? <Skeleton className="h-4 w-10" /> : <p>{`${percentageUsed.toFixed(2)}%`}</p>}
      {isLoading ? (
        <Skeleton className="h-4 w-18" />
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">
          {formatTokenAmount(usedTokens)} / {formatTokenAmount(limitTokens)}
        </p>
      )}
    </div>
    {isLoading ? <Skeleton className="h-2 w-full mb-4" /> : <Progress value={percentageUsed} className="mb-4" />}
  </div>
)

const TokenUsageCostBreakdown = ({
  rows,
  isLoading,
}: {
  rows: { label: string; amount: number; cost: number }[]
  isLoading: boolean
}) => (
  <div className="text-zinc-500 dark:text-zinc-400 space-y-1">
    {rows.map((row) => (
      <div key={row.label} className="flex justify-between items-center">
        <p>{row.label}</p>
        <div className="flex items-center">
          {isLoading ? <Skeleton className="h-4 w-8" /> : <p>{formatTokenAmount(row.amount)}</p>}
          <p className="mx-2 text-zinc-500 dark:text-zinc-400">•</p>
          {isLoading ? <Skeleton className="h-4 w-10" /> : <p className="text-foreground">{formatPrice(row.cost)}</p>}
        </div>
      </div>
    ))}
  </div>
)

const TokenUsageCostTotal = ({
  total,
  isLoading,
  error,
}: {
  total: number
  isLoading: boolean
  error: TokenUsageError | null
}) => (
  <div className="bg-muted/60 -m-4 p-4 space-y-2">
    <div className="flex justify-between items-center">
      <p className="text-zinc-500 dark:text-zinc-400">Total</p>
      {isLoading ? <Skeleton className="h-4 w-10" /> : <p className="text-foreground">{formatPrice(total)}</p>}
    </div>
    {error && (
      <div className="text-red-500 flex gap-2 leading-snug">
        <AlertOctagon className="size-4" />
        <div>
          <p>Token usage could not be retrieved</p>
          {process.env.NODE_ENV === "development" && <p className="italic">{`(Dev only: ${error.name})`}</p>}
        </div>
      </div>
    )}
  </div>
)

const Separator = () => <hr className="-mx-4" />
