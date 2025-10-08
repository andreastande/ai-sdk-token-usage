import type { UIMessage } from "ai-sdk-token-usage"
import { Streamdown } from "streamdown"

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

function AssistantMessage({ message }: { message: UIMessage }) {
	return (
		<div className="max-w-3xl break-words whitespace-pre-wrap">
			{message.parts.map((part, i) => {
				switch (part.type) {
					case "text":
						return <Streamdown key={`${message.id}-${i}`}>{part.text}</Streamdown>
					default:
						return null
				}
			})}
		</div>
	)
}

export default function Message({ message }: { message: UIMessage }) {
	return message.role === "user" ? <UserMessage message={message} /> : <AssistantMessage message={message} />
}
