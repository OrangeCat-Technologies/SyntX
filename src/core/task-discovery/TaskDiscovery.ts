import * as path from "path"
import * as fs from "fs/promises"
import { HistoryItem } from "@roo-code/types"
import { getTaskDirectoryPath } from "../../utils/storage"
import { readTaskMessages } from "../task-persistence/taskMessages"
import { taskMetadata } from "../task-persistence/taskMetadata"

export class TaskDiscovery {
	private globalStoragePath: string
	private currentWorkspace: string

	constructor(globalStoragePath: string, currentWorkspace?: string) {
		this.globalStoragePath = globalStoragePath
		this.currentWorkspace = currentWorkspace || ""
	}

	/**
	 * Gets recent tasks with their metadata
	 */
	async getRecentTasks(limit: number = 10): Promise<HistoryItem[]> {
		try {
			const tasksDir = path.join(this.globalStoragePath, "tasks")

			// Check if tasks directory exists
			try {
				await fs.access(tasksDir)
			} catch {
				console.log(`Tasks directory not found: ${tasksDir}`)
				return []
			}

			const taskIds = await fs.readdir(tasksDir)
			console.log(`Found ${taskIds.length} task directories in ${tasksDir}`)

			if (taskIds.length === 0) {
				return []
			}

			// Filter out non-directory entries
			const validTaskIds = []
			for (const taskId of taskIds) {
				try {
					const taskPath = path.join(tasksDir, taskId)
					const stat = await fs.stat(taskPath)
					if (stat.isDirectory()) {
						validTaskIds.push(taskId)
					}
				} catch (error) {
					console.warn(`Skipping invalid task entry ${taskId}:`, error)
				}
			}

			console.log(`Found ${validTaskIds.length} valid task directories`)

			const tasks = await Promise.all(
				validTaskIds.map(async (taskId) => {
					try {
						const messages = await readTaskMessages({
							taskId,
							globalStoragePath: this.globalStoragePath,
						})

						if (messages.length === 0) {
							console.warn(`No messages found for task ${taskId}`)
							return null
						}

						const taskNumber = parseInt(taskId.split("-")[1]) || 0

						// Try to get workspace from task metadata file first
						let workspace = this.currentWorkspace
						try {
							const { FileContextTracker } = await import("../context-tracking/FileContextTracker")
							const fileContextTracker = new FileContextTracker({} as any, taskId)
							const taskMetadata = await fileContextTracker.getTaskMetadata(taskId)
							if (taskMetadata.workspace) {
								workspace = taskMetadata.workspace
							}
						} catch (error) {
							// Fall back to current workspace if metadata reading fails
							console.warn(`Failed to read workspace from task metadata for ${taskId}:`, error)
						}

						const metadata = await taskMetadata({
							messages,
							taskId,
							taskNumber,
							globalStoragePath: this.globalStoragePath,
							workspace: workspace,
						})

						console.log(`Successfully processed task ${taskId}: ${metadata.historyItem.task}`)
						return metadata.historyItem
					} catch (error) {
						console.warn(`Failed to process task ${taskId}:`, error)
						return null
					}
				}),
			)

			const filteredTasks = tasks.filter((task): task is HistoryItem => task !== null)
			console.log(`Returning ${filteredTasks.length} tasks (limit: ${limit})`)

			// Prioritize current workspace tasks
			const currentWorkspaceTasks = filteredTasks.filter((task) => task.workspace === this.currentWorkspace)
			const otherWorkspaceTasks = filteredTasks.filter((task) => task.workspace !== this.currentWorkspace)

			// Sort each group by timestamp and combine (current workspace first)
			const sortedCurrentTasks = currentWorkspaceTasks.sort((a, b) => b.ts - a.ts)
			const sortedOtherTasks = otherWorkspaceTasks.sort((a, b) => b.ts - a.ts)

			return [...sortedCurrentTasks, ...sortedOtherTasks].slice(0, limit)
		} catch (error) {
			console.error("Error discovering tasks:", error)
			return []
		}
	}

	/**
	 * Gets a specific task by ID
	 */
	async getTaskById(taskId: string): Promise<HistoryItem | null> {
		try {
			const messages = await readTaskMessages({
				taskId,
				globalStoragePath: this.globalStoragePath,
			})

			if (messages.length === 0) {
				return null
			}

			const taskNumber = parseInt(taskId.split("-")[1]) || 0

			const metadata = await taskMetadata({
				messages,
				taskId,
				taskNumber,
				globalStoragePath: this.globalStoragePath,
				workspace: "",
			})

			return metadata.historyItem
		} catch (error) {
			console.error(`Error getting task ${taskId}:`, error)
			return null
		}
	}

	/**
	 * Searches tasks by content
	 */
	async searchTasks(query: string, limit: number = 5): Promise<HistoryItem[]> {
		const allTasks = await this.getRecentTasks(50) // Get more for searching
		const lowerQuery = query.toLowerCase()

		return allTasks
			.filter(
				(task) => task.task.toLowerCase().includes(lowerQuery) || task.id.toLowerCase().includes(lowerQuery),
			)
			.slice(0, limit)
	}
}
