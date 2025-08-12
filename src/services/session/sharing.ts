import { z } from "zod"
import * as vscode from "vscode"

import type { HistoryItem, ClineMessage } from "@roo-code/types"

import { SerializedSessionSchema, SerializedSession } from "./schema"
import { readTaskMessages, saveTaskMessages } from "../../core/task-persistence/taskMessages"
import { readApiMessages, saveApiMessages } from "../../core/task-persistence/apiMessages"
import { getTaskDirectoryPath } from "../../utils/storage"
import { GlobalFileNames } from "../../shared/globalFileNames"

const CURRENT_VERSION = "1.0.0"

/**
 * Export a local task and its messages to a JSON file chosen by the user.
 *
 * The exported file is a SerializedSession containing the current version, the provided task, and its stored messages.
 * Prompts the user with a Save dialog (default filename derived from the task name). If the user cancels the dialog, the function returns without writing a file.
 *
 * @param task - The task (HistoryItem) to export.
 * @param globalStoragePath - Extension global storage path used to read the task's persisted messages.
 */
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

/**
 * Import a serialized task session from a JSON file chosen by the user into local storage.
 *
 * Opens a file picker for JSON files, validates the selected file against the
 * SerializedSessionSchema, and on success saves the session messages under the
 * session's task id in the extension's global storage. Shows an error message
 * for invalid files or a confirmation message on successful import.
 *
 * @param globalStoragePath - Filesystem path to the extension's global storage directory where task data will be written
 */
export async function importTask(globalStoragePath: string): Promise<void> {
	const openDialogOptions: vscode.OpenDialogOptions = {
		canSelectMany: false,
		openLabel: "Import Task",
		filters: {
			"JSON Files": ["json"],
		},
	}

	const uris = await vscode.window.showOpenDialog(openDialogOptions)
	if (!uris || uris.length === 0) return

	const uri = uris[0]
	const fileContent = await vscode.workspace.fs.readFile(uri)
	const json = JSON.parse(fileContent.toString())

	const parseResult = SerializedSessionSchema.safeParse(json)
	if (!parseResult.success) {
		vscode.window.showErrorMessage(`Invalid task file: ${parseResult.error.message}`)
		return
	}

	const session = parseResult.data
	const newTaskId = session.task.id

	await saveTaskMessages({
		taskId: newTaskId,
		globalStoragePath,
		messages: session.messages,
	})

	const taskDir = await getTaskDirectoryPath(globalStoragePath, newTaskId)

	vscode.window.showInformationMessage(`Task "${session.task.task}" imported successfully.`)
}

// ========== Cloud Sharing (Export/Import via Website) ==========

/**
 * Cloud session sharing allows:
 * 1) VS Code extension to POST a SerializedSession to the website
 * 2) Website returns a session id and share URL
 * 3) Other users can GET the session by id or via the API URL embedded in the share page
 *
 * Website API contract (MVP):
 * - POST /api/sessions
 *   Body: SerializedSession (see SerializedSessionSchema)
 *   Response: 201 { id: string, url?: string }
 * - GET /api/sessions/:id
 *   Response: 200 SerializedSession
 *
 * Base URL resolution order:
 * - VS Code setting: syntx.sessionSharing.baseUrl (e.g., https://sessions.syntx.dev)
 * - Env var: SYNTX_SESSIONS_BASE_URL
 * If not set, the commands will show a VS Code error.
 */

const SETTINGS_NAMESPACE = "syntx"
const SETTINGS_KEY = "sessionSharing.baseUrl"
const ENV_BASE_URL = "SYNTX_SESSIONS_BASE_URL"

/**
 * Resolves the base URL to use for session sharing.
 *
 * Checks the extension setting `syntx.sessionSharing.baseUrl` first, then the
 * environment variable `SYNTX_SESSIONS_BASE_URL`. Trims whitespace and
 * removes any trailing slashes. Returns the normalized URL string or
 * `undefined` if neither source provides a value.
 *
 * @returns The normalized base URL or `undefined` when not configured.
 */
function resolveBaseUrl(): string | undefined {
	const cfg = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE).get<string>(SETTINGS_KEY)
	const env = process.env[ENV_BASE_URL]
	const base = (cfg?.trim() || env?.trim() || "").replace(/\/+$/, "")
	return base || undefined
}

/**
 * Ensure a global `fetch` function is available and return it, or `undefined` after notifying the user.
 *
 * Detects whether a global `fetch` is present. If available, returns the `fetch` function. If not, shows
 * an error message prompting the user to use VS Code with Node >= 18 or add a fetch polyfill and returns
 * `undefined`.
 *
 * @returns The global `fetch` function when present, otherwise `undefined`.
 */
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

/**
 * Concatenates a base URL and a path into a single URL, ensuring exactly one slash separates them.
 *
 * The function adds a leading slash to `path` if missing but does not modify `baseUrl` (it will not remove trailing slashes).
 *
 * @param baseUrl - The base URL to prepend (used as-is).
 * @param path - The endpoint path; may start with or without a leading `/`.
 * @returns The joined URL string.
 */
function apiUrl(baseUrl: string, path: string): string {
	return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`
}

/**
 * Build a public share URL for a session identifier.
 *
 * @param baseUrl - Base site URL (no trailing slash expected)
 * @param id - Session identifier (will be URL-encoded)
 * @returns A full URL pointing to the session page (e.g. `{baseUrl}/session/{encodedId}`)
 */
function shareUrl(baseUrl: string, id: string): string {
	return `${baseUrl}/session/${encodeURIComponent(id)}`
}

/**
 * Uploads the given task session to the configured cloud service and returns a shareable URL.
 *
 * This reads the task's stored messages, posts a serialized session to the configured
 * sessions API (from the extension setting `syntx.sessionSharing.baseUrl` or env
 * `SYNTX_SESSIONS_BASE_URL`), copies the resulting share URL to the clipboard, and
 * shows an informational message in VS Code.
 *
 * If the environment lacks a global `fetch` implementation or no base URL is configured,
 * the function shows an error and returns `undefined`. On any network or server error the
 * function shows an error and returns `undefined`.
 *
 * @param task - The task history item to export; its `id` and metadata are included in the session.
 * @param globalStoragePath - Extension global storage path used to read the task's stored messages.
 * @param opts.token - Optional API key sent as `Syntx-Api-Key` for authenticated uploads.
 * @returns The share URL on success, or `undefined` if the export failed or was aborted.
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
		const res = await f(apiUrl(baseUrl, "/api/sessions"), {
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
 * Fetches a serialized session from the configured server by its session id and imports it into local storage.
 *
 * Retrieves the session at GET /api/sessions/:id, validates the payload against the session schema, and saves its messages
 * under a new local task id in the provided global storage path. On success shows an informational message; on failure
 * shows an error message to the user and returns without throwing.
 *
 * @param id - The server-side session identifier (opaque or numeric) to fetch.
 * @param globalStoragePath - The extension's global storage filesystem path where imported task messages will be saved.
 * @param opts.token - Optional Bearer token to include in the request Authorization header.
 */
export async function importTaskFromCloudById(
	id: string,
	globalStoragePath: string,
	opts?: { token?: string },
): Promise<void> {
	const f = ensureFetchAvailable()
	if (!f) return

	const baseUrl = resolveBaseUrl()
	if (!baseUrl) {
		vscode.window.showErrorMessage(
			`Session sharing base URL not set. Configure "${SETTINGS_NAMESPACE}.${SETTINGS_KEY}" or env ${ENV_BASE_URL}.`,
		)
		return
	}

	try {
		const res = await f(apiUrl(baseUrl, `/api/sessions/${encodeURIComponent(id)}`), {
			method: "GET",
			headers: {
				Accept: "application/json",
				...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
			},
		})

		if (!res.ok) {
			const text = await res.text().catch(() => "")
			vscode.window.showErrorMessage(`Import failed: ${res.status} ${text || res.statusText}`)
			return
		}

		const json = await res.json()
		const parse = SerializedSessionSchema.safeParse(json)
		if (!parse.success) {
			vscode.window.showErrorMessage(`Invalid session data from cloud: ${parse.error.message}`)
			return
		}

		const session = parse.data
		const newTaskId = session.task.id

		await saveTaskMessages({
			taskId: newTaskId,
			globalStoragePath,
			messages: session.messages,
		})

		vscode.window.showInformationMessage(`Imported session "${session.task.task}" from cloud.`)
	} catch (err: any) {
		vscode.window.showErrorMessage(`Import failed: ${err?.message || String(err)}`)
	}
}

/**
 * Import a serialized session from a full session API URL and persist it as a new local task.
 *
 * Fetches the JSON session at `sessionApiUrl`, validates it against the session schema, and saves the session messages under the session's task id in the extension global storage.
 *
 * @param sessionApiUrl - Full API URL that returns a serialized session (e.g. https://.../api/sessions/abc)
 * @param globalStoragePath - Extension global storage directory (fsPath) where the imported task's messages will be saved
 * @param opts.token - Optional bearer token to include in the request Authorization header
 */
export async function importTaskFromCloudByUrl(
	sessionApiUrl: string,
	globalStoragePath: string,
	opts?: { token?: string },
): Promise<void> {
	const f = ensureFetchAvailable()
	if (!f) return

	try {
		const res = await f(sessionApiUrl, {
			method: "GET",
			headers: {
				Accept: "application/json",
				...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
			},
		})

		if (!res.ok) {
			const text = await res.text().catch(() => "")
			vscode.window.showErrorMessage(`Import failed: ${res.status} ${text || res.statusText}`)
			return
		}

		const json = await res.json()
		const parse = SerializedSessionSchema.safeParse(json)
		if (!parse.success) {
			vscode.window.showErrorMessage(`Invalid session data from cloud: ${parse.error.message}`)
			return
		}

		const session = parse.data
		const newTaskId = session.task.id

		await saveTaskMessages({
			taskId: newTaskId,
			globalStoragePath,
			messages: session.messages,
		})

		vscode.window.showInformationMessage(`Imported session "${session.task.task}" from cloud.`)
	} catch (err: any) {
		vscode.window.showErrorMessage(`Import failed: ${err?.message || String(err)}`)
	}
}

/**
 * Register a VS Code URI handler that accepts deep links of the form
 * `vscode://<extension-id>/import-session?id=<sessionId>` and imports the referenced session.
 *
 * The handler expects the URI path to be `/import-session` and a query parameter `id`.
 * When invoked it calls `importTaskFromCloudById` using the extension's global storage path
 * (from `context.globalStorageUri.fsPath`) to persist imported session messages.
 *
 * Call from your extension's activation function with the extension context. The created
 * handler is added to `context.subscriptions`.
 */
export function registerSessionImportUriHandler(context: vscode.ExtensionContext) {
	const handler: vscode.UriHandler = {
		handleUri: async (uri) => {
			try {
				// Expect path like "/import-session"
				if (uri.path !== "/import-session") return
				const params = new URLSearchParams(uri.query)
				const id = params.get("id")
				if (!id) {
					vscode.window.showErrorMessage("Missing session id.")
					return
				}
				// Use extension's global storage to persist messages
				const globalStoragePath = context.globalStorageUri.fsPath
				await importTaskFromCloudById(id, globalStoragePath)
			} catch (err: any) {
				vscode.window.showErrorMessage(`Failed to handle import link: ${err?.message || String(err)}`)
			}
		},
	}

	context.subscriptions.push(vscode.window.registerUriHandler(handler))
}
