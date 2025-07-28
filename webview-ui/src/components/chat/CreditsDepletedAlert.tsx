import React from "react"
import { useTranslation } from "react-i18next"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "@src/utils/vscode"

interface CreditsDepletedAlertProps {
	onClose: () => void
	errorType?: string
	errorData?: any
}

const CreditsDepletedAlert: React.FC<CreditsDepletedAlertProps> = ({ onClose, errorType, errorData }) => {
	const { t: _t } = useTranslation()

	// Determine if this is a free usage limit error
	const isFreeUsageError =
		errorType === "free_usage_limit_exceeded" ||
		(errorData && typeof errorData === "string" && errorData.includes("free_usage_limit_exceeded"))

	const handleBuyCredits = () => {
		vscode.postMessage({ type: "openExternal", url: "https://syntx.dev" })
	}

	const _handleUpgradeModel = () => {
		vscode.postMessage({ type: "openExternal", url: "https://syntx.dev" })
	}

	return (
		<div className="bg-vscode-editor-background border border-vscode-border rounded-xs p-4 mb-4">
			<div className="flex justify-between items-start mb-3">
				<div className="flex items-center gap-2">
					<span className="codicon codicon-warning text-vscode-editorWarning-foreground"></span>
					<h3 className="text-vscode-foreground font-bold">
						{isFreeUsageError ? "Free Usage Limit Reached" : "Credits Depleted"}
					</h3>
				</div>
				<VSCodeButton appearance="icon" onClick={onClose} className="shrink-0">
					<span className="codicon codicon-close"></span>
				</VSCodeButton>
			</div>

			{isFreeUsageError ? (
				<div className="space-y-3">
					<p className="text-vscode-foreground">
						Credits renew monthly on your account start date. To continue now, you can pay per use for
						DeepSeek or buy credits for other models. Deepseek v3 premium will be available for use after
						payment.
					</p>

					<VSCodeButton onClick={handleBuyCredits}>Buy Credits</VSCodeButton>
				</div>
			) : (
				<div className="space-y-3">
					<p className="text-vscode-foreground">
						You&apos;ve run out of credits. Please purchase more credits to continue using proprietary
						models.
					</p>

					<VSCodeButton onClick={handleBuyCredits}>Buy Credits</VSCodeButton>
				</div>
			)}
		</div>
	)
}

export default CreditsDepletedAlert
