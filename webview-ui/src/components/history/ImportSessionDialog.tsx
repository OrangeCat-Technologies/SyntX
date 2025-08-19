import React, { useState } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { vscode } from "@/utils/vscode"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Button,
	Input,
} from "@/components/ui"

interface ImportSessionDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const ImportSessionDialog: React.FC<ImportSessionDialogProps> = ({ open, onOpenChange }) => {
	const { t } = useAppTranslation()
	const [url, setUrl] = useState("")
	const [isImporting, setIsImporting] = useState(false)

	const handleImport = async () => {
		if (!url.trim()) {
			return
		}

		setIsImporting(true)
		try {
			vscode.postMessage({
				type: "importTaskFromCloudByUrl",
				values: { url: url.trim() },
			})
			// Close dialog and reset form
			setUrl("")
			onOpenChange(false)
		} finally {
			setIsImporting(false)
		}
	}

	const handleClose = () => {
		if (!isImporting) {
			setUrl("")
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{t("history:importFromLink")}</DialogTitle>
					<DialogDescription>{t("history:pasteShareUrl")}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label htmlFor="share-url" className="text-sm font-medium text-vscode-foreground">
							Share URL
						</label>
						<Input
							id="share-url"
							type="url"
							placeholder="https://..."
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							disabled={isImporting}
							className="w-full"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey && url.trim()) {
									e.preventDefault()
									handleImport()
								}
							}}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="secondary" onClick={handleClose} disabled={isImporting}>
						{t("history:cancel")}
					</Button>
					<Button
						variant="default"
						onClick={handleImport}
						disabled={!url.trim() || isImporting}
						className="gap-2">
						{isImporting ? (
							<>
								<span className="codicon codicon-loading codicon-modifier-spin" />
								{t("history:importing")}
							</>
						) : (
							<>
								<span className="codicon codicon-cloud-download" />
								{t("history:import")}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
