import React from "react"
import { Button } from "../ui"
import { vscode } from "../../utils/vscode"
import { useExtensionState } from "../../context/ExtensionStateContext"

// Replace the empty interface with a type alias for object
type ProfileSettingsProps = object

export const ProfileSettings: React.FC<ProfileSettingsProps> = () => {
	const { websiteUsername, websiteNotAuthenticated } = useExtensionState()

	const handleSignIn = () => {
		vscode.postMessage({ type: "initiateWebsiteAuth" })
	}

	const handleSignOut = () => {
		vscode.postMessage({ type: "signOutWebsite" })
	}

	const handleViewProfile = () => {
		vscode.postMessage({ type: "openExternal", url: "https://syntx.dev" })
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium text-vscode-foreground mb-4">Profile</h3>

				{websiteNotAuthenticated ? (
					<div className="space-y-4">
						<p className="text-vscode-descriptionForeground">
							Sign in to sync your settings and access premium features.
						</p>
						<Button
							onClick={handleSignIn}
							className="bg-vscode-button-background hover:bg-vscode-button-hoverBackground text-vscode-button-foreground">
							Sign In with SyntX
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-vscode-button-background rounded-full flex items-center justify-center">
								<span className="text-vscode-button-foreground font-medium">
									{websiteUsername?.charAt(0).toUpperCase() || "?"}
								</span>
							</div>
							<div>
								<p className="font-medium text-vscode-foreground">{websiteUsername}</p>
								<p className="text-sm text-vscode-descriptionForeground">SyntX Account</p>
							</div>
						</div>

						<div className="space-y-2">
							<Button onClick={handleViewProfile} variant="outline" className="mr-2">
								View Full Profile
							</Button>
							<Button
								onClick={handleSignOut}
								variant="outline"
								className="text-vscode-errorForeground border-vscode-errorForeground hover:bg-vscode-errorBackground">
								Sign Out
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default ProfileSettings
