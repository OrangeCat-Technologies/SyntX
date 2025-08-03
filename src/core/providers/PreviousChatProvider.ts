import { readApiMessages } from "../task-persistence/apiMessages"
import { getTaskDirectoryPath } from "../../utils/storage"
import { summarizeConversation } from "../condense"
import { ApiHandler } from "../../api"
import { ApiMessage } from "../task-persistence/apiMessages"

export class PreviousChatProvider {
	private apiHandler: ApiHandler
	private systemPrompt: string
	private globalStoragePath: string

	constructor(apiHandler: ApiHandler, systemPrompt: string, globalStoragePath: string) {
		this.apiHandler = apiHandler
		this.systemPrompt = systemPrompt
		this.globalStoragePath = globalStoragePath
	}

	/**
	 * Gets a condensed summary for a specific task
	 */
	async getCondensedSummary(taskId: string): Promise<string> {
		return PreviousChatProvider.getCondensedSummary(
			taskId,
			this.globalStoragePath,
			this.apiHandler,
			this.systemPrompt,
		)
	}

	/**
	 * Static method to get condensed summary for a specific task
	 */
	static async getCondensedSummary(
		taskId: string,
		globalStoragePath: string,
		apiHandler?: ApiHandler,
		systemPrompt?: string,
		taskInstance?: any,
	): Promise<string> {
		console.log(`[PREV_CHAT] Starting condensation for task: ${taskId}`)
		try {
			const messages = await readApiMessages({
				taskId,
				globalStoragePath,
			})

			if (messages.length === 0) {
				return "No messages found for this previous chat"
			}

			// If no apiHandler provided, return raw message content instead of condensed summary
			if (!apiHandler || !systemPrompt) {
				const messageCount = messages.length
				const firstMessage = messages[0]
				const lastMessage = messages[messages.length - 1]

				return `Previous chat with ${messageCount} messages. First message: ${
					typeof firstMessage.content === "string"
						? firstMessage.content.slice(0, 100) + "..."
						: Array.isArray(firstMessage.content)
							? firstMessage.content
									.map((c) => (c.type === "text" ? c.text.slice(0, 50) : `[${c.type}]`))
									.join(" ")
									.slice(0, 100) + "..."
							: "[Complex content]"
				}`
			}

			console.log(`[PREV_CHAT] Starting AI condensation for task ${taskId}`)

			// Show condensing UI indicator if task instance is provided
			if (taskInstance && typeof taskInstance.say === "function") {
				await taskInstance.say("condense_context", undefined, undefined, true) // partial = true
			}

			const result = await summarizeConversation(
				messages,
				apiHandler,
				systemPrompt,
				taskId,
				-1, // prevContextTokens - use -1 to indicate this is for previous chat, not regular condensing
				false, // isAutomaticTrigger
			)

			if (result.error) {
				return `Error condensing previous chat: ${result.error}`
			}

			// Show completed condensing UI indicator if task instance is provided
			if (taskInstance && typeof taskInstance.say === "function") {
				await taskInstance.say(
					"condense_context",
					undefined,
					undefined,
					false,
					undefined,
					undefined,
					{ isNonInteractive: true },
					{
						summary: result.summary,
						cost: result.cost,
						prevContextTokens: -1, // Use -1 to indicate previous chat condensing
						newContextTokens: result.newContextTokens || 0,
					},
				)
			}

			return result.summary || "Could not generate summary for previous chat"
		} catch (error) {
			return `Error accessing previous chat: ${error instanceof Error ? error.message : String(error)}`
		}
	}

	/**
	 * Extracts task IDs from @previous-chat mentions
	 */
	static extractTaskIds(text: string): string[] {
		const pattern = /@previous-chat-([a-zA-Z0-9-]+)/g
		const matches = Array.from(text.matchAll(pattern))
		return matches.map((m) => m[1])
	}

	/**
	 * Replaces @previous-chat mentions with condensed summaries
	 */
	async replaceWithSummaries(text: string): Promise<string> {
		const taskIds = PreviousChatProvider.extractTaskIds(text)

		let processedText = text
		for (const taskId of taskIds) {
			const summary = await this.getCondensedSummary(taskId)
			processedText = processedText.replace(
				`@previous-chat-${taskId}`,
				`[Previous Chat Summary - Task ${taskId}]\n${summary}`,
			)
		}

		return processedText
	}

	/**
	 * Checks if text contains @previous-chat mentions
	 */
	static hasPreviousChatMentions(text: string): boolean {
		return /@previous-chat-[a-zA-Z0-9-]+/.test(text)
	}
}
