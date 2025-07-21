import React from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

export interface Boilerplate {
	id: string
	title: string
	description?: string
	initialInput: string
}

interface BoilerplateListProps {
	boilerplates: Boilerplate[]
	onSelect: (boilerplate: Boilerplate) => void
}

const BoilerplateList: React.FC<BoilerplateListProps> = ({ boilerplates, onSelect }) => {
	return (
		<div className="flex flex-col gap-4 items-center mt-6">
			<h3 className="text-lg font-bold mb-2">Get Started with a Sample Task</h3>
			<div className="flex flex-col gap-3 w-full max-w-md">
				{boilerplates.map((bp) => (
					<div key={bp.id} className="border rounded p-4 bg-vscode-editor-background flex flex-col gap-1">
						<div className="font-semibold text-base">{bp.title}</div>
						{bp.description && (
							<div className="text-xs text-vscode-descriptionForeground mb-2">{bp.description}</div>
						)}
						<VSCodeButton appearance="primary" onClick={() => onSelect(bp)}>
							Start
						</VSCodeButton>
					</div>
				))}
			</div>
		</div>
	)
}

export const DEFAULT_BOILERPLATES: Boilerplate[] = [
	{
		id: "portfolio-website",
		title: "Make me a portfolio website",
		description: "Generate a personal portfolio website to showcase my projects and skills.",
		initialInput:
			"Create a modern, responsive portfolio website for me. Include sections for About, Projects, and Contact. Use a popular frontend framework if possible.",
	},
	{
		id: "codebase-docs",
		title: "Make a documentation for my codebase",
		description: "Generate comprehensive documentation for my codebase, including setup, usage, and API details.",
		initialInput:
			"Analyze my codebase and generate detailed documentation, including setup instructions, usage examples, and API reference.",
	},
	{
		id: "snake-game",
		title: "Make me a snake game",
		description: "Create a playable snake game using a modern programming language and framework.",
		initialInput:
			"Build a simple snake game that can be played in the browser. Use JavaScript and HTML/CSS or a suitable framework.",
	},
]

export default BoilerplateList
