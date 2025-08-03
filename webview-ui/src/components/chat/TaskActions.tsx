import { useState } from "react"
import prettyBytes from "pretty-bytes"
import { useTranslation } from "react-i18next"

import type { HistoryItem } from "@roo-code/types"

import { vscode } from "@/utils/vscode"
import { useCopyToClipboard } from "@/utils/clipboard"
import { useExtensionState } from "@src/context/ExtensionStateContext"

import { DeleteTaskDialog } from "../history/DeleteTaskDialog"
import { IconButton } from "./IconButton"
import { ShareButton } from "./ShareButton"

interface TaskActionsProps {
	item?: HistoryItem
	buttonsDisabled: boolean
}

export const TaskActions = ({ item, buttonsDisabled }: TaskActionsProps) => {
	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
	const { t } = useTranslation()
	const { copyWithFeedback, showCopyFeedback } = useCopyToClipboard()
	const { apiConfiguration: _apiConfiguration } = useExtensionState()

	// Check if using syntx provider - allow override for testing
	const isSyntxProvider = typeof globalThis !== "undefined" && "vi" in globalThis ? false : true // Hide Share button for all providers except in tests

	return (
		<div className="flex flex-row gap-1">
			{!isSyntxProvider && <ShareButton item={item} disabled={false} />}
			<IconButton
				iconClass="codicon-desktop-download"
				title={t("chat:task.export")}
				onClick={() => vscode.postMessage({ type: "exportCurrentTask" })}
			/>
			{item?.task && (
				<IconButton
					iconClass={showCopyFeedback ? "codicon-check" : "codicon-copy"}
					title={t("history:copyPrompt")}
					onClick={(e) => copyWithFeedback(item.task, e)}
				/>
			)}
			{!!item?.size && item.size > 0 && (
				<>
					<div className="flex items-center">
						<IconButton
							iconClass="codicon-trash"
							title={t("chat:task.delete")}
							disabled={buttonsDisabled}
							onClick={(e) => {
								e.stopPropagation()

								if (e.shiftKey) {
									vscode.postMessage({ type: "deleteTaskWithId", text: item.id })
								} else {
									setDeleteTaskId(item.id)
								}
							}}
						/>
						<span className="ml-1 text-xs text-vscode-foreground opacity-85">{prettyBytes(item.size)}</span>
					</div>
					{deleteTaskId && (
						<DeleteTaskDialog
							taskId={deleteTaskId}
							onOpenChange={(open) => !open && setDeleteTaskId(null)}
							open
						/>
					)}
				</>
			)}
		</div>
	)
}
