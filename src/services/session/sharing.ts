import * as vscode from "vscode"

import type { HistoryItem } from "@roo-code/types"

import { SerializedSessionSchema, SerializedSession } from "./schema"
import { readTaskMessages, saveTaskMessages } from "../../core/task-persistence/taskMessages"
import { readApiMessages, saveApiMessages } from "../../core/task-persistence/apiMessages"
import { getTaskDirectoryPath } from "../../utils/storage"

const CURRENT_VERSION = "1.0.0"

export async function exportTask(task: HistoryItem, globalStoragePath: string): Promise<void> {
	const messages = await readTaskMessages({ taskId: task.id, globalStoragePath })
	const apiMessages = await readApiMessages({ taskId: task.id, globalStoragePath })

	const session: SerializedSession = {
		version: CURRENT_VERSION,
		task,
		messages,
	}

	const saveDialogOptions: vscode.SaveDialogOptions = {
		saveLabel: "Export Task",
		filters: {
			"JSON Files": ["json"],
		},
		defaultUri: vscode.Uri.file(`${task.task.replace(/[^a-z0-9]/gi, "_")}.json`),
	}

	const uri = await vscode.window.showSaveDialog(saveDialogOptions)
	if (!uri) return

	await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(session, null, 2)))
	vscode.window.showInformationMessage(`Task exported to ${uri.fsPath}`)
}

export async function importTask(globalStoragePath: string): Promise<SerializedSession | undefined> {
	const openDialogOptions: vscode.OpenDialogOptions = {
		canSelectMany: false,
		openLabel: "Import Task",
		filters: {
			"JSON Files": ["json"],
		},
	}

	const uris = await vscode.window.showOpenDialog(openDialogOptions)
	if (!uris || uris.length === 0) return undefined

	const uri = uris[0]
	const fileContent = await vscode.workspace.fs.readFile(uri)
	const json = JSON.parse(fileContent.toString())

	const parseResult = SerializedSessionSchema.safeParse(json)
	if (!parseResult.success) {
		vscode.window.showErrorMessage(`Invalid task file: ${parseResult.error.message}`)
		return undefined
	}

	const session = parseResult.data
	const newTaskId = session.task.id

	await saveTaskMessages({
		taskId: newTaskId,
		globalStoragePath,
		messages: session.messages,
	})

	// Also save empty API messages to satisfy getTaskWithId requirement
	await saveApiMessages({
		taskId: newTaskId,
		globalStoragePath,
		messages: [],
	})

	const taskDir = await getTaskDirectoryPath(globalStoragePath, newTaskId)

	return session
}

// ========== Cloud Sharing (Export/Import via Website) ==========

/**
 * Cloud session sharing allows:
 * 1) VS Code extension to POST a SerializedSession to the website
 * 2) Website returns a session id and share URL
 * 3) Other users can GET the session by id or via share URL
 *
 * Website API contract:
 * - POST /api/sessions
 *   Body: SerializedSession (see SerializedSessionSchema)
 *   Headers: Syntx-Api-Key: {api_key}
 *   Response: 201 { id: string, url?: string }
 *
 * - GET /api/public/sessions/:id (Recommended for VS Code extension)
 *   Headers: Syntx-Api-Key: {api_key} (optional but recommended)
 *   Response: 200 SerializedSession
 *
 * - GET /api/sessions/:id (Fallback, requires authentication)
 *   Headers: Syntx-Api-Key: {api_key}
 *   Response: 200 SerializedSession
 *
 * URL Format Support:
 * - Share URLs: https://yoursite.com/session/ABC123
 * - API URLs: https://yoursite.com/api/sessions/ABC123
 * - Session IDs: ABC123
 *
 * Base URL resolution order:
 * - VS Code setting: syntx.sessionSharing.baseUrl (e.g., https://sessions.syntx.dev)
 * - Env var: SYNTX_SESSIONS_BASE_URL
 * - Extracted from provided URL
 * If not set, the commands will show a VS Code error.
 */

const SETTINGS_NAMESPACE = "syntx"
const SETTINGS_KEY = "sessionSharing.baseUrl"
const ENV_BASE_URL = "SYNTX_SESSIONS_BASE_URL"

function resolveBaseUrl(): string | undefined {
	const cfg = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE).get<string>(SETTINGS_KEY)
	const env = process.env[ENV_BASE_URL]
	const base = (cfg?.trim() || env?.trim() || "").replace(/\/+$/, "")
	return base || undefined
}

function ensureFetchAvailable(): typeof fetch | undefined {
	// VS Code on Node >=18 has global fetch. If not, instruct configuration.
	if (typeof fetch !== "function") {
		vscode.window.showErrorMessage(
			"Global fetch is not available in this environment. Please use VS Code with Node >= 18 or add a fetch polyfill.",
		)
		return undefined
	}
	return fetch
}

function apiUrl(baseUrl: string, path: string): string {
	return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`
}

function shareUrl(baseUrl: string, id: string): string {
	return `${baseUrl}/session/${encodeURIComponent(id)}`
}

/**
 * Extracts session ID from various URL formats:
 * - Share URL: https://yoursite.com/session/ABC123 -> ABC123
 * - API URL: https://yoursite.com/api/sessions/ABC123 -> ABC123
 * - Direct ID: ABC123 -> ABC123
 */
function extractSessionIdFromUrl(urlOrId: string): {
	id: string
	baseUrl?: string
	username?: string
} {
	// Handle new format: username/sessionId (e.g., "viragtiwari/HzKozOxIxl4dO0YijPu0q")
	if (!urlOrId.includes("://") && urlOrId.includes("/")) {
		const parts = urlOrId.split("/")
		if (parts.length === 2) {
			return { username: parts[0], id: parts[1] } // Extract session ID from username/sessionId
		}
	}

	// If it's already just an ID, return it
	if (!urlOrId.includes("://") && !urlOrId.includes("/")) {
		return { id: urlOrId }
	}

	try {
		const url = new URL(urlOrId)
		const baseUrl = `${url.protocol}//${url.host}`

		// Handle share URL format: /session/ABC123
		const sessionMatch = url.pathname.match(/\/session\/([^/]+)/)
		if (sessionMatch) {
			return { id: sessionMatch[1], baseUrl }
		}

		// Handle API URL format: /api/sessions/ABC123
		const apiMatch = url.pathname.match(/\/api\/sessions\/([^/]+)/)
		if (apiMatch) {
			return { id: apiMatch[1], baseUrl }
		}

		throw new Error("Unable to extract session ID from URL")
	} catch (err) {
		throw new Error(`Invalid URL format: ${urlOrId}`)
	}
}

/**
 * Export current task session to cloud.
 * Returns the share URL on success (also copies to clipboard).
 */
export async function exportTaskToCloud(
	task: HistoryItem,
	globalStoragePath: string,
	opts?: { token?: string },
): Promise<string | undefined> {
	const f = ensureFetchAvailable()
	if (!f) return

	const baseUrl = resolveBaseUrl()
	if (!baseUrl) {
		vscode.window.showErrorMessage(
			`Session sharing base URL not set. Configure "${SETTINGS_NAMESPACE}.${SETTINGS_KEY}" or env ${ENV_BASE_URL}.`,
		)
		return
	}

	const messages = await readTaskMessages({ taskId: task.id, globalStoragePath })
	// apiMessages are not part of the current export schema; kept here if we extend later
	// const apiMessages = await readApiMessages({ taskId: task.id, globalStoragePath });

	const session: SerializedSession = {
		version: CURRENT_VERSION,
		task,
		messages,
	}

	try {
		const res = await f(apiUrl(baseUrl, "/api/sessions/create"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(opts?.token ? { "Syntx-Api-Key": `${opts.token}` } : {}),
			},
			body: JSON.stringify(session),
		})

		if (!res.ok) {
			const text = await res.text().catch(() => "")
			vscode.window.showErrorMessage(`Export failed: ${res.status} ${text || res.statusText}`)
			return
		}

		const body = (await res.json().catch(() => ({}) as any)) as { id?: string; url?: string }
		const id = body.id
		if (!id) {
			vscode.window.showErrorMessage("Export succeeded but response did not include an id.")
			return
		}
		const url = body.url || shareUrl(baseUrl, id)

		// Copy to clipboard for convenience
		void vscode.env.clipboard.writeText(url)
		vscode.window.showInformationMessage(`Session shared: ${url}`)
		return url
	} catch (err: any) {
		vscode.window.showErrorMessage(`Export failed: ${err?.message || String(err)}`)
		return
	}
}

/**
 * Import a session directly from a full API URL.
 * Useful if the website's "Import to VS Code" deep link passes an API link instead of an id.
 */
export async function importTaskFromCloudByUrl(
	sessionUrlOrId: string,
	globalStoragePath: string,
	opts?: { token?: string },
): Promise<SerializedSession | undefined> {
	const f = ensureFetchAvailable()
	if (!f) return undefined

	try {
		const { id, username } = extractSessionIdFromUrl(sessionUrlOrId)

		const baseUrl = resolveBaseUrl()
		if (!baseUrl) {
			vscode.window.showErrorMessage(
				`Session sharing base URL not set. Configure "${SETTINGS_NAMESPACE}.${SETTINGS_KEY}" or env ${ENV_BASE_URL}.`,
			)
			return undefined
		}

		const apiEndpoint = apiUrl(baseUrl, "/api/sessions")
		const res = await f(apiEndpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				...(opts?.token ? { "Syntx-Api-Key": `${opts.token}` } : {}),
			},
			body: JSON.stringify({
				id,
				username,
			}),
		})

		if (!res.ok) {
			const text = await res.text().catch(() => "")
			vscode.window.showErrorMessage(
				`Import failed: ${res.status} ${text || res.statusText} (URL: ${apiEndpoint})`,
			)
			return undefined
		}

		const json = await res.json()
		const parse = SerializedSessionSchema.safeParse(json)
		if (!parse.success) {
			vscode.window.showErrorMessage(`Invalid session data from cloud: ${parse.error.message}`)
			return undefined
		}

		const session = parse.data
		const newTaskId = session.task.id

		await saveTaskMessages({
			taskId: newTaskId,
			globalStoragePath,
			messages: session.messages,
		})

		// Also save empty API messages to satisfy getTaskWithId requirement
		await saveApiMessages({
			taskId: newTaskId,
			globalStoragePath,
			messages: [],
		})

		return session
	} catch (err: any) {
		vscode.window.showErrorMessage(`Import failed: ${err?.message || String(err)}`)
		return undefined
	}
}
