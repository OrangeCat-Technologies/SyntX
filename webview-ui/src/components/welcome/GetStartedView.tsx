import { vscode } from "../../utils/vscode"

const GetStartedView = () => {
	const handleAuth = () => {
		vscode.postMessage({ type: "initiateWebsiteAuth" })
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-vscode-editor-background">
			<div className="max-w-md mx-auto p-8 text-center">
				{/* SyntX Logo */}
				<div className="flex items-center justify-center mb-8">
					<div
						style={{
							backgroundColor: "#FF6B35",
							borderRadius: "12px",
							padding: "12px",
							width: "64px",
							height: "64px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}>
						<span
							style={{
								fontSize: "24px",
								fontWeight: "bold",
								color: "white",
								fontFamily: "monospace",
							}}>
							🐱
						</span>
					</div>
					<h1
						style={{
							marginLeft: "16px",
							fontSize: "32px",
							fontWeight: "bold",
							color: "var(--vscode-foreground)",
							margin: "0",
						}}>
						SyntX
					</h1>
				</div>

				{/* Welcome Text */}
				<h2
					style={{
						fontSize: "18px",
						color: "var(--vscode-descriptionForeground)",
						marginBottom: "32px",
						lineHeight: "1.5",
					}}>
					Sign in and let SyntX accelerate your development workflow
				</h2>

				{/* Get Started Button */}
				<button
					onClick={handleAuth}
					style={{
						backgroundColor: "#007ACC",
						color: "white",
						border: "none",
						borderRadius: "6px",
						padding: "12px 24px",
						fontSize: "16px",
						fontWeight: "500",
						cursor: "pointer",
						transition: "background-color 0.2s",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#005a9e"
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "#007ACC"
					}}>
					Get Started
				</button>
			</div>
		</div>
	)
}

export default GetStartedView
