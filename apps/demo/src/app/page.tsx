"use client"

import { useChat } from "@ai-sdk/react"
import { useState } from "react"
import Message from "@/components/message"
import ModelPicker from "@/components/model-picker"
import TokenUsage from "@/components/token-usage"
import { Input } from "@/components/ui/input"
import { getModel } from "@/lib/utils"
import type { Model } from "@/types/model"

export default function Chat() {
	const [selectedModel, setSelectedModel] = useState<Model>(getModel("gpt-5"))
	const [input, setInput] = useState("")
	const { messages, sendMessage } = useChat()

	return (
		<div className="w-full max-w-2xl py-24 mx-auto space-y-14">
			{messages.map((message) => (
				<Message key={message.id} message={message} />
			))}

			<form
				onSubmit={(e) => {
					e.preventDefault()
					sendMessage({ text: input }, { body: { model: selectedModel } })
					setInput("")
				}}
				className="fixed bottom-0 w-full max-w-2xl pb-8 bg-background pt-2"
			>
				<div className="flex items-center space-x-4">
					<ModelPicker onSelectModel={(value) => setSelectedModel(getModel(value))} />

					<Input
						value={input}
						placeholder="Say something..."
						onChange={(e) => setInput(e.currentTarget.value)}
						className="flex-1 bg-background"
					/>

					<TokenUsage messages={messages} model={selectedModel} />
				</div>
			</form>
		</div>
	)
}
