import { models } from "@/lib/models"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export default function ModelPicker({ onSelectModel }: { onSelectModel: (value: string) => void }) {
	return (
		<Select defaultValue="gpt-5" onValueChange={onSelectModel}>
			<SelectTrigger className="w-40 bg-background">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{models.map(({ id, name }) => (
					<SelectItem key={id} value={id}>
						{name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
