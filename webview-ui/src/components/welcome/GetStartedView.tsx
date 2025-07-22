import React, { useEffect, useState } from "react"
import { vscode } from "../../utils/vscode"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import logoBase64 from "../../assets/logo-base64"

const DEMO_SHOWN_KEY = "syntx_demo_shown"

const DEMO_CONTENT = `# Welcome to SyntX!

Thank you for installing SyntX. Here's a quick demo of what you can do:

## 🚀 Get Started
- Sign in with your account to unlock all features.
- Use the chat to ask for help, generate code, or automate tasks.

## 💡 Example Prompts
- **Make me a portfolio website**
- **Make a documentation for my codebase**
- **Make me a snake game**

## 📚 Tips
- You can always access help and documentation from the sidebar.
- Try out the boilerplate prompts to get started quickly.

Enjoy building with SyntX!`

const GetStartedView = () => {
	const [authAttempted, setAuthAttempted] = useState(false)
	const [githubError, setGithubError] = useState("")
	const [showDemo, setShowDemo] = useState(false)

	useEffect(() => {
		if (!localStorage.getItem(DEMO_SHOWN_KEY)) {
			setShowDemo(true)
		}
	}, [])

	const handleCloseDemo = () => {
		setShowDemo(false)
		localStorage.setItem(DEMO_SHOWN_KEY, "1")
	}

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
			{/* Demo Markdown Modal */}
			{showDemo && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						background: "rgba(0,0,0,0.4)",
						zIndex: 1000,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}>
					<div
						style={{
							background: "var(--vscode-editor-background)",
							borderRadius: 8,
							maxWidth: 600,
							width: "90%",
							padding: 32,
							boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
							position: "relative",
							overflowY: "auto",
							maxHeight: "80vh",
						}}>
						<div style={{ position: "absolute", top: 16, right: 16 }}>
							<VSCodeButton appearance="secondary" onClick={handleCloseDemo}>
								Close
							</VSCodeButton>
						</div>
						<div style={{ marginTop: 16 }}>
							<MarkdownRenderer markdown={DEMO_CONTENT} />
						</div>
					</div>
				</div>
			)}
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

// Simple markdown renderer (replace with your preferred renderer if needed)
const MarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
	// Use a basic implementation or swap for a library like marked/react-markdown if available
	// For now, just render as preformatted text
	return <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{markdown}</pre>
}

export default GetStartedView
