import { exportTask, importTask, exportTaskToCloud, importTaskFromCloudByUrl } from "../sharing"
import { vi, describe, it, expect, beforeEach } from "vitest"
import * as vscode from "vscode"

// Mock proper-lockfile to avoid lockfile creation issues
vi.mock("proper-lockfile", () => ({
	default: {
		lock: vi.fn().mockResolvedValue(() => Promise.resolve()),
	},
	lock: vi.fn().mockResolvedValue(() => Promise.resolve()),
}))

// Mock fs (sync version used by safeWriteJson)
vi.mock("fs", () => ({
	default: {
		createWriteStream: vi.fn(() => ({
			on: vi.fn((event, callback) => {
				if (event === "finish") setTimeout(callback, 0)
			}),
			destroy: vi.fn(),
			destroyed: false,
		})),
	},
	createWriteStream: vi.fn(() => ({
		on: vi.fn((event, callback) => {
			if (event === "finish") setTimeout(callback, 0)
		}),
		destroy: vi.fn(),
		destroyed: false,
	})),
}))

// Mock stream-json modules
vi.mock("stream-json/Disassembler", () => ({
	default: {
		disassembler: vi.fn(() => ({
			on: vi.fn(),
			pipe: vi.fn(() => ({
				pipe: vi.fn(),
			})),
			write: vi.fn(),
			end: vi.fn(),
		})),
	},
}))

vi.mock("stream-json/Stringer", () => ({
	default: {
		stringer: vi.fn(() => ({
			on: vi.fn(),
		})),
	},
}))
vi.mock("fs/promises", () => {
	const mockFiles = new Map()
	const mockDirectories = new Set(["/", "/test", "/fake"])

	const ensureDirectoryExists = (path: string) => {
		const parts = path.split("/")
		let currentPath = ""
		for (const part of parts) {
			if (!part) continue
			currentPath += "/" + part
			mockDirectories.add(currentPath)
		}
	}

	const mockMkdir = vi.fn().mockImplementation(async (path, options) => {
		if (options?.recursive || path.startsWith("/test") || path.startsWith("/fake") || path.includes(".lock")) {
			ensureDirectoryExists(path)
			return Promise.resolve()
		}
		mockDirectories.add(path)
		return Promise.resolve()
	})

	const mockWriteFile = vi.fn().mockImplementation(async (path, content) => {
		const parentDir = path.split("/").slice(0, -1).join("/")
		ensureDirectoryExists(parentDir)
		mockFiles.set(path, content)
		return Promise.resolve()
	})

	const mockReadFile = vi.fn().mockImplementation(async (path) => {
		if (mockFiles.has(path)) {
			return mockFiles.get(path)
		}
		// Return empty arrays for task message files that don't exist yet
		if (path.includes("ui_messages.json") || path.includes("api_conversation_history.json")) {
			return JSON.stringify([])
		}
		const error = new Error(`ENOENT: no such file or directory, open '${path}'`)
		;(error as any).code = "ENOENT"
		throw error
	})

	const mockAccess = vi.fn().mockImplementation(async (path) => {
		if (mockFiles.has(path) || mockDirectories.has(path) || path.startsWith("/test") || path.startsWith("/fake")) {
			return Promise.resolve()
		}
		// Allow access to ui_messages.json files and lockfiles even if they don't exist yet
		if (
			path.includes("ui_messages.json") ||
			path.includes("api_conversation_history.json") ||
			path.includes(".lock")
		) {
			return Promise.resolve()
		}
		const error = new Error(`ENOENT: no such file or directory, access '${path}'`)
		;(error as any).code = "ENOENT"
		throw error
	})

	const mockUnlink = vi.fn().mockResolvedValue(undefined)
	const mockRename = vi.fn().mockResolvedValue(undefined)

	return {
		default: {
			mkdir: mockMkdir,
			writeFile: mockWriteFile,
			readFile: mockReadFile,
			access: mockAccess,
			unlink: mockUnlink,
			rename: mockRename,
		},
		mkdir: mockMkdir,
		writeFile: mockWriteFile,
		readFile: mockReadFile,
		access: mockAccess,
		unlink: mockUnlink,
		rename: mockRename,
	}
})

vi.mock("vscode", () => ({
	window: {
		showSaveDialog: vi.fn(),
		showOpenDialog: vi.fn(),
		showInformationMessage: vi.fn(),
		showErrorMessage: vi.fn(),
	},
	workspace: {
		fs: {
			writeFile: vi.fn(),
			readFile: vi.fn(),
		},
		getConfiguration: vi.fn(() => ({ get: vi.fn() })),
	},
	env: { clipboard: { writeText: vi.fn() } },
	Uri: {
		file: vi.fn((path) => ({ fsPath: path })),
	},
}))

describe("Task Sharing Service", () => {
	const mockTask = {
		id: "test-task-id",
		task: "Test Task",
		number: 1,
		ts: Date.now(),
		tokensIn: 10,
		tokensOut: 20,
		totalCost: 0.01,
	}
	const mockGlobalStoragePath = "/fake/storage/path"

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("exportTask", () => {
		it("should export a task to a JSON file", async () => {
			const mockUri = vscode.Uri.file("/fake/export/path.json")
			vi.mocked(vscode.window.showSaveDialog).mockResolvedValue(mockUri)

			await exportTask(mockTask, mockGlobalStoragePath)

			expect(vscode.window.showSaveDialog).toHaveBeenCalled()
			expect(vscode.workspace.fs.writeFile).toHaveBeenCalled()
			expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(`Task exported to ${mockUri.fsPath}`)
		})

		it("should handle cancellation of save dialog", async () => {
			vi.mocked(vscode.window.showSaveDialog).mockResolvedValue(undefined)

			await exportTask(mockTask, mockGlobalStoragePath)

			expect(vscode.workspace.fs.writeFile).not.toHaveBeenCalled()
		})
	})

	describe("importTask", () => {
		it("should import a task from a JSON file", async () => {
			const mockUri = vscode.Uri.file("/fake/import/path.json")
			const mockSession = {
				version: "1.0.0",
				task: mockTask,
				messages: [],
			}
			vi.mocked(vscode.window.showOpenDialog).mockResolvedValue([mockUri])
			vi.mocked(vscode.workspace.fs.readFile).mockResolvedValue(Buffer.from(JSON.stringify(mockSession)))

			const result = await importTask(mockGlobalStoragePath)

			expect(vscode.window.showOpenDialog).toHaveBeenCalled()
			expect(vscode.workspace.fs.readFile).toHaveBeenCalledWith(mockUri)
			expect(result).toEqual(mockSession)
		})

		it("should handle cancellation of open dialog", async () => {
			vi.mocked(vscode.window.showOpenDialog).mockResolvedValue(undefined)

			await importTask(mockGlobalStoragePath)

			expect(vscode.workspace.fs.readFile).not.toHaveBeenCalled()
		})

		it("should show error for invalid file format", async () => {
			const mockUri = vscode.Uri.file("/fake/import/path.json")
			vi.mocked(vscode.window.showOpenDialog).mockResolvedValue([mockUri])
			vi.mocked(vscode.workspace.fs.readFile).mockResolvedValue(Buffer.from(JSON.stringify({ invalid: "data" })))

			await importTask(mockGlobalStoragePath)

			expect(vscode.window.showErrorMessage).toHaveBeenCalled()
		})
	})

	describe("exportTaskToCloud", () => {
		beforeEach(() => {
			// Mock the global fetch function
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({ id: "test-session-id", url: "https://example.com/s/test-session-id" }),
					text: () => Promise.resolve(""),
				}),
			) as any

			// Mock VS Code configuration
			vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
				get: vi.fn().mockReturnValue("https://test.syntx.dev"),
			} as any)
		})

		it("should include Syntx-Api-Key header when a token is provided", async () => {
			const token = "test-api-key"

			await exportTaskToCloud(mockTask, mockGlobalStoragePath, { token })

			expect(global.fetch).toHaveBeenCalledWith(
				"https://test.syntx.dev/api/sessions/create",
				expect.objectContaining({
					headers: expect.objectContaining({
						"Syntx-Api-Key": token,
					}),
				}),
			)
		})
	})

	describe("importTaskFromCloudByUrl", () => {
		beforeEach(() => {
			const mockSession = {
				version: "1.0.0",
				task: mockTask,
				messages: [],
			}

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockSession),
					text: () => Promise.resolve(""),
				}),
			) as any

			vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
				get: vi.fn().mockReturnValue("https://test.syntx.dev"),
			} as any)
		})

		it("should import a task from a cloud URL", async () => {
			const sessionUrl = "https://test.syntx.dev/session/test-session-id"

			await importTaskFromCloudByUrl(sessionUrl, mockGlobalStoragePath)

			expect(global.fetch).toHaveBeenCalledWith(
				"https://test.syntx.dev/api/sessions",
				expect.objectContaining({ method: "POST" }),
			)
		})
	})
})
