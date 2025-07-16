export interface Agent {
	id: string
	name: string
	provider: string
	description: string
	showModes: boolean
}

export const agents: Agent[] = [
	{
		id: "software-dev",
		name: "Software Development Agent",
		provider: "default",
		description:
			"Specialized in coding tasks, software architecture, debugging, and general development workflows.",
		showModes: true,
	},
	{
		id: "data-science",
		name: "Data Science Agent",
		provider: "data",
		description: "Expert in data analysis, machine learning, statistical modeling, and visualization.",
		showModes: false,
	},
]

export const getAgent = (agentId: string): Agent | undefined => {
	return agents.find((agent) => agent.id === agentId)
}
