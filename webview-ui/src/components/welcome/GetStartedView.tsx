import React, { useState } from "react"
import { vscode } from "../../utils/vscode"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import logoBase64 from "../../assets/logo-base64"

const GetStartedView = () => {
	const [authAttempted, setAuthAttempted] = useState(false)
	const [githubError, setGithubError] = useState("")

	const handleAuth = () => {
		setAuthAttempted(true)
		setGithubError("")
		vscode.postMessage({ type: "initiateWebsiteAuth" })
	}

	// Listen for auth error messages from VS Code extension
	// (You may need to wire this up in your main App if not already)
	// useEffect(() => {
	// 	const handler = (event: MessageEvent) => {
	// 		if (event.data?.type === "githubAuthError") {
	// 			setGithubError(event.data.error || "Authentication failed. Please try again.")
	// 		}
	// 	}
	// 	window.addEventListener("message", handler)
	// 	return () => window.removeEventListener("message", handler)
	// }, [])

	return (
		<div
			className="vscode-centered-container"
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				height: "100vh",
				width: "100%",
				padding: "1.8rem",
				boxSizing: "border-box",
				overflow: "auto",
			}}>
			{/* Gradient border container */}
			<div
				style={{
					padding: "2px", // Border thickness
					borderRadius: "8px",
					background: "linear-gradient(180deg, rgba(255, 165, 0, 1), rgba(255, 255, 255, 0.73))",
					boxShadow: "0 0 15px rgba(255, 165, 0, 0.4)",
					maxWidth: "28rem",
					width: "100%",
					margin: "auto",
				}}>
				{/* Main container with VS Code themed border */}
				<div
					className="vscode-card"
					style={{
						borderRadius: "6px",
						maxWidth: "100%",
						width: "100%",
						padding: "2rem 1rem",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						backgroundColor: "var(--vscode-editor-background)",
						margin: "0",
					}}>
					{/* Logo and heading */}
					<div
						className="flex items-center mb-4"
						style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
						<img
							src={logoBase64}
							alt="SyntX Logo"
							style={{
								width: "50px",
								height: "50px",
								marginRight: "12px",
							}}
						/>
						<h1
							className="text-2xl font-medium m-0"
							style={{
								fontSize: "1.5rem",
								fontWeight: 600,
								margin: 0,
								fontFamily: "'Montserrat Alternates', sans-serif",
								color: "var(--vscode-editor-foreground)",
							}}>
							SyntX
						</h1>
					</div>

					{/* Subheading text */}
					<p
						className="text-center text-sm mb-6"
						style={{
							textAlign: "center",
							fontSize: "0.875rem",
							marginBottom: "1.5rem",
							color: "var(--vscode-descriptionForeground)",
							fontWeight: "500",
						}}>
						Sign in and let SyntX accelerate your development workflow
					</p>

					{/* Get Started button */}
					<VSCodeButton
						appearance="primary"
						onClick={handleAuth}
						style={{
							minWidth: "150px",
							marginBottom: "0.75rem",
							borderRadius: "0.75rem",
							fontWeight: "bold",
							backgroundColor: "rgba(255, 165, 0, 1)",
							borderColor: "rgba(255, 165, 0, 1)",
							color: "white",
						}}>
						{authAttempted ? "Try Again" : "Get Started"}
					</VSCodeButton>

					{/* Display GitHub auth errors */}
					{githubError && (
						<div
							style={{
								color: "var(--vscode-errorForeground)",
								fontSize: "0.75rem",
								marginTop: "0.5rem",
								marginBottom: "0.5rem",
								textAlign: "center",
							}}>
							{githubError}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default GetStartedView
