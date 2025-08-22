import React from "react"
import { Boilerplate } from "../../utils/boilerplates" // Assuming this path

interface BoilerplateListProps {
	boilerplates: Boilerplate[]
	onSelectBoilerplate: (boilerplate: Boilerplate) => void
}

export const BoilerplateList: React.FC<BoilerplateListProps> = ({ boilerplates, onSelectBoilerplate }) => {
	return (
		<div>
			<p
				className="object-center text-center text-vscode-descriptionForeground"
				style={{
					alignContent: "center",
					fontSize: "14",
				}}>
				Dont know where to start? Try these prompts instead
			</p>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{boilerplates.map((boilerplate) => (
					<div
						key={boilerplate.id}
						className="border border-vscode-panel-border rounded-md p-2 cursor-pointer hover-orange"
						onClick={() => onSelectBoilerplate(boilerplate)}>
						<p className="text-sm float-left content-center align-middle pr-3.5">{boilerplate.emoticon}</p>
						<p className="text-sm text-vscode-descriptionForeground">{boilerplate.description}</p>
					</div>
				))}
			</div>
		</div>
	)
}
