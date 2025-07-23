import React from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "../../utils/vscode"

interface CreditsDepletedAlertProps {
	onClose: () => void
}

const CreditsDepletedAlert: React.FC<CreditsDepletedAlertProps> = ({ onClose }) => {
	const handleBuyCredits = () => {
		// Open the profile page in the browser with auth data
		const profileUrl = "https://syntx.dev/"

		vscode.postMessage({
			type: "openExternal",
			url: profileUrl,
		})

		// Close the alert after clicking
		onClose()
	}

	return (
		<div className="bg-vscode-editor-background p-4 rounded-md my-4 border border-vscode-tab-border relative">
			<button
				className="absolute top-2 right-2 text-vscode-descriptionForeground hover:text-vscode-foreground"
				onClick={onClose}
				aria-label="Close">
				<span className="codicon codicon-close" />
			</button>
			<h3 className="text-vscode-foreground mb-2">Buy Credits to Access Proprietary Models</h3>
			<p className="text-vscode-descriptionForeground mb-4">
				Please log in at https://syntx.dev to purchase credits and go to View Profile in settings.
			</p>
			<div className="flex gap-2">
				<VSCodeButton appearance="primary" onClick={handleBuyCredits}>
					Purchase Credits
				</VSCodeButton>
			</div>
		</div>
	)
}

export default CreditsDepletedAlert
