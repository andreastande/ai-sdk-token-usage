import type { UseChatHelpers } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { Streamdown } from "streamdown"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./ai-elements/reasoning"

function UserMessage({ message }: { message: UIMessage }) {
  const messageContent = message.parts.find((part) => part.type === "text")?.text ?? ""

  return (
    <div className="flex justify-end">
      <div className="max-w-2xl rounded-2xl bg-muted p-3 break-words whitespace-pre-wrap">
        <span>{messageContent}</span>
      </div>
    </div>
  )
}

function AssistantMessage({
  message,
  status,
  isLastMsg,
}: {
  message: UIMessage
  status: UseChatHelpers<UIMessage>["status"]
  isLastMsg: boolean
}) {
  return (
    <div className="max-w-3xl break-words whitespace-pre-wrap">
      {message.parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return <Streamdown key={`${message.id}-${i}`}>{part.text}</Streamdown>
          case "reasoning":
            return (
              <Reasoning
                key={`${message.id}-${i}`}
                className="w-full"
                isStreaming={status === "streaming" && i === message.parts.length - 1 && isLastMsg}
              >
                <ReasoningTrigger />
                <ReasoningContent>{part.text}</ReasoningContent>
              </Reasoning>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

export default function Message({
  message,
  status,
  isLastMsg,
}: {
  message: UIMessage
  status: UseChatHelpers<UIMessage>["status"]
  isLastMsg: boolean
}) {
  return message.role === "user" ? (
    <UserMessage message={message} />
  ) : (
    <AssistantMessage message={message} status={status} isLastMsg={isLastMsg} />
  )
}
