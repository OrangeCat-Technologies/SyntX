import { Anthropic } from "@anthropic-ai/sdk"
import { parseMentions } from "./index"
import { UrlContentFetcher } from "../../services/browser/UrlContentFetcher"
import { FileContextTracker } from "../context-tracking/FileContextTracker"
import { PreviousChatProvider } from "../providers/PreviousChatProvider"
import { ApiHandler } from "../../api"

/**
 * Process mentions in user content, specifically within task and feedback tags
 */
export async function processUserContentMentions({
	userContent,
	cwd,
	urlContentFetcher,
	fileContextTracker,
	rooIgnoreController,
	showRooIgnoredFiles = true,
	globalStoragePath,
	apiHandler,
	systemPrompt,
	taskInstance,
}: {
	userContent: Anthropic.Messages.ContentBlockParam[]
	cwd: string
	urlContentFetcher: UrlContentFetcher
	fileContextTracker: FileContextTracker
	rooIgnoreController?: any
	showRooIgnoredFiles?: boolean
	globalStoragePath?: string
	apiHandler?: ApiHandler
	systemPrompt?: string
	taskInstance?: any
}) {
	console.log(`[PROCESS] processUserContentMentions called with ${userContent.length} blocks`)
	userContent.forEach((block, i) => {
		if (block.type === "text") {
			console.log(`[PROCESS] Block ${i}: "${block.text.substring(0, 200)}..."`)
		} else {
			console.log(`[PROCESS] Block ${i}: ${block.type}`)
		}
	})

	// Process userContent array, which contains various block types:
	// TextBlockParam, ImageBlockParam, ToolUseBlockParam, and ToolResultBlockParam.
	// We need to apply parseMentions() to:
	// 1. All TextBlockParam's text (first user message with task)
	// 2. ToolResultBlockParam's content/context text arrays if it contains
	// "<feedback>" (see formatToolDeniedFeedback, attemptCompletion,
	// executeCommand, and consecutiveMistakeCount >= 3) or "<answer>"
	// (see askFollowupQuestion), we place all user generated content in
	// these tags so they can effectively be used as markers for when we
	// should parse mentions).

	const processText = async (text: string): Promise<string> => {
		// First, process regular mentions
		let processedText = await parseMentions(
			text,
			cwd,
			urlContentFetcher,
			fileContextTracker,
			rooIgnoreController,
			showRooIgnoredFiles,
		)

		// Then, process @previous-chat mentions if we have the required context
		if (globalStoragePath && apiHandler && systemPrompt) {
			// Look for the placeholder that parseMentions creates
			const placeholderPattern =
				/<previous_chat_summary task_id="([a-f0-9-]+)">\nPrevious chat reference detected - processing will happen at task level\n<\/previous_chat_summary>/g
			const matches = Array.from(processedText.matchAll(placeholderPattern))

			for (const match of matches) {
				const [fullMatch, taskId] = match
				console.log(`[PREV_CHAT] Condensing task: ${taskId}`)
				try {
					const summary = await PreviousChatProvider.getCondensedSummary(
						taskId,
						globalStoragePath,
						apiHandler,
						systemPrompt,
						taskInstance,
					)

					// Replace the placeholder content with actual summary
					processedText = processedText.replace(
						fullMatch,
						`<previous_chat_summary task_id="${taskId}">\n${summary}\n</previous_chat_summary>`,
					)
				} catch (error) {
					// Keep the error message that was already inserted by parseMentions
					console.error(`[PREV_CHAT] Error: ${error}`)
				}
			}
		}

		return processedText
	}

	return Promise.all(
		userContent.map(async (block) => {
			const shouldProcessMentions = (text: string) => {
				// Process mentions if text contains task/feedback tags OR if it contains @previous-chat mentions
				return text.includes("<task>") || text.includes("<feedback>") || text.includes("@previous-chat-")
			}

			if (block.type === "text") {
				console.log(`[PROCESS] Processing text block: "${block.text.substring(0, 100)}..."`)
				if (shouldProcessMentions(block.text)) {
					return {
						...block,
						text: await processText(block.text),
					}
				}

				return block
			} else if (block.type === "tool_result") {
				if (typeof block.content === "string") {
					if (shouldProcessMentions(block.content)) {
						return {
							...block,
							content: await processText(block.content),
						}
					}

					return block
				} else if (Array.isArray(block.content)) {
					const parsedContent = await Promise.all(
						block.content.map(async (contentBlock) => {
							if (contentBlock.type === "text" && shouldProcessMentions(contentBlock.text)) {
								return {
									...contentBlock,
									text: await processText(contentBlock.text),
								}
							}

							return contentBlock
						}),
					)

					return { ...block, content: parsedContent }
				}

				return block
			}

			return block
		}),
	)
}
