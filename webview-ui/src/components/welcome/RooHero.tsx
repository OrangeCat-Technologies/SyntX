// import logoBase64 from "../../assets/logo-base64" hiding import for precommit script
import { useExtensionState } from "../../context/ExtensionStateContext"

const getTimeBasedGreeting = () => {
	const hour = new Date().getHours()
	if (hour < 12) return "Good morning"
	if (hour < 18) return "Good afternoon"
	return "Good evening"
}

const RooHero = () => {
	const { websiteUsername, websiteNotAuthenticated } = useExtensionState()

	return (
		<div className="flex flex-col pb-1 forced-color-adjust-none" style={{ paddingLeft: 13, paddingTop: 16 }}>
			{/* Logo and greeting positioned at very top left */}
			<div className="flex items-center gap-3 mb-6" style={{ alignSelf: "flex-start" }}>
				{/* <img
					src={logoBase64}
					alt="SyntX Logo"
					style={{
						width: "80px",
						height: "80px",
					}}
				/> */}
				{!websiteNotAuthenticated && websiteUsername && (
					<div style={{ padding: "0 20px", flexShrink: 0 }}>
						<p
							style={{
								// color: `linear-gradient(to right,var(--vscode-titleBar-activeForeground) 50%, var(--vscode-titleBar-activeForeground) 100%)`,
								background: "var(--vscode-editor-foreground)",
								// background: `linear-gradient(to right, var(--vscode-editor-foreground) 50%, var(--vscode-editor-foreground), var(--vscode-editorWidget-foreground))`,
								// background:
								// 	"linear-gradient(to right, rgba(149, 246, 255, 1)50%,rgba(149, 246, 255, 1), rgba(255, 255, 255, 1))",
								WebkitBackgroundClip: "text",
								fontSize: "18px",
								fontWeight: "650",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
								display: "inline-block",
							}}>
							{getTimeBasedGreeting()} {websiteUsername}!
						</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default RooHero
