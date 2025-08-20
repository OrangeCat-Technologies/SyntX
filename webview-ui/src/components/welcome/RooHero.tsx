// import logoBase64 from "../../assets/logo-base64" hiding import for precommit script
import { useExtensionState } from "../../context/ExtensionStateContext"

const getTimeBasedGreeting = () => {
	const hour = new Date().getHours()
	if (hour < 12) return "Good morning"
	if (hour < 18) return "Good afternoon"
	return "Good evening"
}

const getGreeting = () => {
	return getTimeBasedGreeting()
}

// Placeholder components for the structure
const Announcement = ({ version, hideAnnouncement }: { version: string; hideAnnouncement: () => void }) => {
	console.log(version)
	console.log(hideAnnouncement)
	return <div>Announcement placeholder</div>
}

const RooHero = () => {
	const { websiteUsername, websiteNotAuthenticated } = useExtensionState()

	// For this component, we'll assume no task is active to show the welcome state
	const task = null
	const showAnnouncement = false
	const version = "1.0.0"
	const hideAnnouncement = () => {}

	return (
		<div
			style={{
				overflow: "hidden",
			}}>
			{task ? (
				<>
					{/* TaskHeader component would be here */}
					{/*
					<TaskHeader
						task={task}
						tokensIn={apiMetrics.totalTokensIn}
						tokensOut={apiMetrics.totalTokensOut}
						doesModelSupportPromptCache={selectedModelInfo.supportsPromptCache}
						cacheWrites={apiMetrics.totalCacheWrites}
						cacheReads={apiMetrics.totalCacheReads}
						totalCost={apiMetrics.totalCost}
						contextTokens={apiMetrics.contextTokens}
						onClose={handleTaskCloseButtonClick}
					/>
					*/}

					{/* Checkpoint warning message */}
					{/*
					{showCheckpointWarning && (
						<div className="px-3">
							<CheckpointWarningMessage />
						</div>
					)}
					*/}
				</>
			) : (
				<div
					style={{
						flex: "1 1 0", // flex-grow: 1, flex-shrink: 1, flex-basis: 0
						minHeight: 0,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						paddingBottom: "10px",
					}}>
					{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}
					<div style={{ padding: "20px 20px", flexShrink: 0 }}>
						<p
							style={{
								// color: `linear-gradient(to right,var(--vscode-titleBar-activeForeground) 50%, var(--vscode-titleBar-activeForeground) 100%)`,
								background: "var(--vscode-editor-foreground)",
								// background: `linear-gradient(to right, var(--vscode-editor-foreground) 50%, var(--vscode-editor-foreground), var(--vscode-editorWidget-foreground))`,
								// background:
								// 	"linear-gradient(to right, rgba(149, 246, 255, 1)50%,rgba(149, 255, 255, 1), rgba(255, 255, 255, 1))",
								WebkitBackgroundClip: "text",
								fontSize: "18px",
								fontWeight: "650",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
								display: "inline-block",
							}}>
							{getGreeting()}
							{!websiteNotAuthenticated && websiteUsername ? ` ${websiteUsername}!` : ""}
						</p>
					</div>
				</div>
			)}
		</div>
	)
}

export default RooHero
