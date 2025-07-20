import React, { useCallback } from "react"
import { vscode } from "../../utils/vscode"
import { agents } from "./agentRegistry"

interface AgentViewProps {
	onDone: () => void
}

const AgentView: React.FC<AgentViewProps> = ({ onDone }) => {
	const handleSelectAgent = useCallback(
		(agentId: string) => {
			const selectedAgent = agents.find((agent) => agent.id === agentId)
			if (selectedAgent) {
				vscode.postMessage({
					type: "agentSelected",
					agentId: selectedAgent.id,
					showModes: selectedAgent.showModes,
				})
				onDone()
			}
		},
		[onDone],
	)

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				backgroundColor: "var(--vscode-editor-background)",
			}}>
			{/* Header */}
			<div
				style={{
					padding: "16px 20px",
					borderBottom: "1px solid var(--vscode-panel-border)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}>
				<h2
					style={{
						margin: 0,
						fontSize: "16px",
						fontWeight: "600",
						color: "var(--vscode-foreground)",
					}}>
					Select Agent
				</h2>
				<button
					onClick={onDone}
					style={{
						background: "none",
						border: "none",
						color: "var(--vscode-foreground)",
						cursor: "pointer",
						fontSize: "18px",
						padding: "4px",
						borderRadius: "3px",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "var(--vscode-toolbar-hoverBackground)"
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "transparent"
					}}>
					×
				</button>
			</div>

			{/* Description */}
			<div
				style={{
					padding: "16px 20px 8px",
					color: "var(--vscode-descriptionForeground)",
					fontSize: "14px",
					lineHeight: "1.4",
				}}>
				Choose an AI agent that specializes in the tasks you need assistance with.
			</div>

			{/* Agent List */}
			<div
				style={{
					padding: "8px 20px 20px",
					flex: 1,
					overflowY: "auto",
				}}>
				{agents.map((agent) => (
					<div
						key={agent.id}
						onClick={() => handleSelectAgent(agent.id)}
						style={{
							padding: "12px 16px",
							marginBottom: "8px",
							border: "1px solid var(--vscode-panel-border)",
							borderRadius: "4px",
							cursor: "pointer",
							backgroundColor: "var(--vscode-list-inactiveSelectionBackground)",
							transition: "all 0.2s ease",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "var(--vscode-list-hoverBackground)"
							e.currentTarget.style.borderColor = "var(--vscode-focusBorder)"
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "var(--vscode-list-inactiveSelectionBackground)"
							e.currentTarget.style.borderColor = "var(--vscode-panel-border)"
						}}>
						<div
							style={{
								fontWeight: "600",
								fontSize: "14px",
								color: "var(--vscode-foreground)",
								marginBottom: "4px",
							}}>
							{agent.name}
						</div>
						<div
							style={{
								fontSize: "13px",
								color: "var(--vscode-descriptionForeground)",
								lineHeight: "1.3",
							}}>
							{agent.description}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default AgentView
