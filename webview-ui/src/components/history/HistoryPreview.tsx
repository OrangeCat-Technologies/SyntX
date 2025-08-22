import path from "path"
import { memo } from "react"

import { vscode } from "@/utils/vscode"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAppTranslation } from "@/i18n/TranslationContext"

import { useTaskSearch } from "./useTaskSearch"
import TaskItem from "./TaskItem"

const HistoryPreview = () => {
	const { tasks } = useTaskSearch()
	const { cwd } = useExtensionState()

	console.log("HistoryPreview DEBUG:", {
		tasksCount: tasks.length,
		firstTask: tasks[0],
		allTasks: tasks,
		cwd: cwd,
	})
	console.log("HistoryPreview tasks data:", {
		count: tasks.length,
		sample: tasks.slice(0, 3),
		fullPathMatchCount: tasks.filter((t) => t.workspace === cwd).length,
		basenameMatchCount: tasks.filter((t) => t.workspace?.endsWith(path.basename(cwd || ""))).length,
	})
	const { t } = useAppTranslation()

	const handleViewAllHistory = () => {
		vscode.postMessage({ type: "switchTab", tab: "history" })
	}

	return (
		<div className="flex flex-col gap-3">
			{/* DEBUG: Always show this */}
			<div style={{ border: "2px solid red", padding: "10px", background: "yellow", color: "black" }}>
				DEBUG: HistoryPreview - Tasks: {tasks.length}
				{tasks.length === 0 && <div>NO TASKS FOUND!</div>}
				{tasks.length > 0 && <div>TASKS EXIST: {tasks.length}</div>}
			</div>

			{tasks.length !== 0 && (
				<>
					<div style={{ border: "1px solid blue", padding: "5px" }}>Tasks are rendering here:</div>
					{tasks.slice(0, 3).map((item, index) => (
						<div key={item.id} style={{ border: "1px solid green", padding: "5px" }}>
							Task {index + 1}: {item.task?.substring(0, 50)}...
							<TaskItem key={item.id} item={item} variant="compact" />
						</div>
					))}
					<button
						onClick={handleViewAllHistory}
						className="text-base text-vscode-descriptionForeground hover:text-vscode-textLink-foreground transition-colors cursor-pointer text-center w-full"
						aria-label={t("history:viewAllHistory")}>
						{t("history:viewAllHistory")}
					</button>
				</>
			)}
		</div>
	)
}

export default memo(HistoryPreview)
