import { BoilerplateList } from "../chat/BoilerplateList"
import RooHero from "../welcome/RooHero"
import { type Boilerplate } from "../../utils/boilerplates"

interface HomeViewProps {
	taskHistory: Array<{ id: string }> // Adjust this to match your actual task history type
	starterBoilerplates: Boilerplate[]
	handleBoilerplateSelect: (boilerplate: Boilerplate) => void
}

export const HomeView = ({ taskHistory, starterBoilerplates, handleBoilerplateSelect }: HomeViewProps) => {
	console.log("task history length", taskHistory)
	return (
		<div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-4 p-4">
			<RooHero />
			<div className="w-full flex flex-col gap-4 max-w-3xl px-3.5 min-[370px]:px-10">
				{/* Show the task history preview if expanded and tasks exist */}
				{/* { <HistoryPreview />} */}
				{/* Show boilerplate list if no task history */}
				{taskHistory.length <= 0 && (
					<BoilerplateList boilerplates={starterBoilerplates} onSelectBoilerplate={handleBoilerplateSelect} />
				)}
			</div>
		</div>
	)
}
