import React from "react"
import { Boilerplate } from "../../utils/boilerplates" // Assuming this path

interface BoilerplateListProps {
	boilerplates: Boilerplate[]
	onSelectBoilerplate: (boilerplate: Boilerplate) => void
}

export const BoilerplateList: React.FC<BoilerplateListProps> = ({ boilerplates, onSelectBoilerplate }) => {
	return (
		<div className="p-4">
			<h2 className="text-lg font-semibold mb-4">Starter Boilerplates</h2>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{boilerplates.map((boilerplate) => (
					<div
						key={boilerplate.id}
						className="border border-vscode-panel-border rounded-md p-4 cursor-pointer hover:bg-vscode-list-hoverBackground"
						onClick={() => onSelectBoilerplate(boilerplate)}>
						<h3 className="text-md font-medium mb-2">{boilerplate.title}</h3>
						<p className="text-sm text-vscode-descriptionForeground">{boilerplate.description}</p>
					</div>
				))}
			</div>
		</div>
	)
}
