"use client"

import { useChat } from "@ai-sdk/react"
import { useTokenContext, useTokenCost } from "ai-sdk-token-usage"
import { useState } from "react"
import Message from "@/components/message"
import ModelPicker from "@/components/model-picker"
import { Input } from "@/components/ui/input"
import { getModel } from "@/lib/utils"
import type { Model } from "@/types/model"

export default function Chat() {
	const [selectedModel, setSelectedModel] = useState<Model>(getModel("gpt-5"))
	const [input, setInput] = useState("")
	const { messages, sendMessage } = useChat()

	const contextWindow = useTokenContext(messages, selectedModel.canonicalSlug)
	const cost = useTokenCost(messages)

	console.log("contextWindow", contextWindow)
	console.log("cost", cost)

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
				className="fixed bottom-8 w-full max-w-2xl"
			>
				<div className="flex items-center space-x-2">
					<ModelPicker onSelectModel={(value) => setSelectedModel(getModel(value))} />

					<Input
						value={input}
						placeholder="Say something..."
						onChange={(e) => setInput(e.currentTarget.value)}
						className="flex-1 bg-background"
					/>
				</div>
			</form>
		</div>
	)
}
