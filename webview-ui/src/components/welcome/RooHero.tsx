import LogoSvg from "../../assets/Logo"
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
				overflow: "visible",
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
						paddingTop: "40px",
						paddingBottom: "10px",
					}}>
					{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}
					<LogoSvg />
					<p
						style={{
							background: `linear-gradient(to right, var(--vscode-editor-selectionForeground) 0%, var(--vscode-titleBar-activeForeground) 50%)`,
							WebkitBackgroundClip: "text",
							backgroundClip: "text",
							color: "var(--vscode-titleBar-activeForeground)",
							backgroundRepeat: "no-repeat",
							fontSize: "14px",
							display: "inline-block",
						}}>
						{getGreeting()}
						{!websiteNotAuthenticated && websiteUsername ? `, ${websiteUsername}.` : ""}
					</p>
				</div>
			)}
		</div>
	)
}

export default RooHero
