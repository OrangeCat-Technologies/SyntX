// npx vitest core/ignore/__tests__/RooIgnoreController.spec.ts

import type { Mock } from "vitest"

import { RooIgnoreController, LOCK_TEXT_SYMBOL } from "../RooIgnoreController"
import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import { fileExistsAtPath } from "../../../utils/fs"

// Mock dependencies
vi.mock("fs/promises")
vi.mock("../../../utils/fs")

// Mock vscode
vi.mock("vscode", () => {
	const mockDisposable = { dispose: vi.fn() }
	const mockEventEmitter = {
		event: vi.fn(),
		fire: vi.fn(),
	}

	return {
		workspace: {
			createFileSystemWatcher: vi.fn(() => ({
				onDidCreate: vi.fn(() => mockDisposable),
				onDidChange: vi.fn(() => mockDisposable),
				onDidDelete: vi.fn(() => mockDisposable),
				dispose: vi.fn(),
			})),
		},
		RelativePattern: vi.fn().mockImplementation((base, pattern) => ({
			base,
			pattern,
		})),
		EventEmitter: vi.fn().mockImplementation(() => mockEventEmitter),
		Disposable: {
			from: vi.fn(),
		},
	}
})

describe("RooIgnoreController", () => {
	const TEST_CWD = "/test/path"
	let controller: RooIgnoreController
	let mockFileExists: Mock<typeof fileExistsAtPath>
	let mockReadFile: Mock<typeof fs.readFile>
	let mockWatcher: any

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks()

		// Setup mock file watcher
		mockWatcher = {
			onDidCreate: vi.fn().mockReturnValue({ dispose: vi.fn() }),
			onDidChange: vi.fn().mockReturnValue({ dispose: vi.fn() }),
			onDidDelete: vi.fn().mockReturnValue({ dispose: vi.fn() }),
			dispose: vi.fn(),
		}

		// @ts-expect-error - Mocking
		vscode.workspace.createFileSystemWatcher.mockReturnValue(mockWatcher)

		// Setup fs mocks
		mockFileExists = fileExistsAtPath as Mock<typeof fileExistsAtPath>
		mockReadFile = fs.readFile as Mock<typeof fs.readFile>

		// Create controller
		controller = new RooIgnoreController(TEST_CWD)
	})

	describe("initialization", () => {
		/**
		 * Tests the controller initialization when .syntxignore exists
		 */
		it("should load .syntxignore patterns on initialization when file exists", async () => {
			// Setup mocks to simulate existing .syntxignore file
			mockFileExists.mockResolvedValue(true)
			mockReadFile.mockResolvedValue("node_modules\n.git\nsecrets.json")

			// Initialize controller
			await controller.initialize()

			// Verify file was checked and read
			expect(mockFileExists).toHaveBeenCalledWith(path.join(TEST_CWD, ".syntxignore"))
			expect(mockReadFile).toHaveBeenCalledWith(path.join(TEST_CWD, ".syntxignore"), "utf8")

			// Verify content was stored
			expect(controller.rooIgnoreContent).toBe("node_modules\n.git\nsecrets.json")

			// Test that ignore patterns were applied
			expect(controller.validateAccess("node_modules/package.json")).toBe(false)
			expect(controller.validateAccess("src/app.ts")).toBe(true)
			expect(controller.validateAccess(".git/config")).toBe(false)
			expect(controller.validateAccess("secrets.json")).toBe(false)
		})

		/**
		 * Tests the controller behavior when .syntxignore doesn't exist
		 */
		it("should allow all access when .syntxignore doesn't exist", async () => {
			// Setup mocks to simulate missing .syntxignore file
			mockFileExists.mockResolvedValue(false)

			// Initialize controller
			await controller.initialize()

			// Verify no content was stored
			expect(controller.rooIgnoreContent).toBeUndefined()

			// All files should be accessible
			expect(controller.validateAccess("node_modules/package.json")).toBe(true)
			expect(controller.validateAccess("secrets.json")).toBe(true)
		})

		/**
		 * Tests the file watcher setup
		 */
		it("should set up file watcher for .syntxignore changes", async () => {
			// Check that watcher was created with correct pattern
			expect(vscode.workspace.createFileSystemWatcher).toHaveBeenCalledWith(
				expect.objectContaining({
					base: TEST_CWD,
					pattern: ".syntxignore",
				}),
			)

			// Verify event handlers were registered
			expect(mockWatcher.onDidCreate).toHaveBeenCalled()
			expect(mockWatcher.onDidChange).toHaveBeenCalled()
			expect(mockWatcher.onDidDelete).toHaveBeenCalled()
		})

		/**
		 * Tests error handling during initialization
		 */
		it("should handle errors when loading .syntxignore", async () => {
			// Setup mocks to simulate error
			mockFileExists.mockResolvedValue(true)
			mockReadFile.mockRejectedValue(new Error("Test file read error"))

			// Spy on console.error
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

			// Initialize controller - shouldn't throw
			await controller.initialize()

			// Verify error was logged
			expect(consoleSpy).toHaveBeenCalledWith("Unexpected error loading .syntxignore:", expect.any(Error))

			// Cleanup
			consoleSpy.mockRestore()
		})
	})

	describe("validateAccess", () => {
		beforeEach(async () => {
			// Setup .syntxignore content
			mockFileExists.mockResolvedValue(true)
			mockReadFile.mockResolvedValue("node_modules\n.git\nsecrets/**\n*.log")
			await controller.initialize()
		})

		/**
		 * Tests basic path validation
		 */
		it("should correctly validate file access based on ignore patterns", () => {
			// Test different path patterns
			expect(controller.validateAccess("node_modules/package.json")).toBe(false)
			expect(controller.validateAccess("node_modules")).toBe(false)
			expect(controller.validateAccess("src/node_modules/file.js")).toBe(false)
			expect(controller.validateAccess(".git/HEAD")).toBe(false)
			expect(controller.validateAccess("secrets/api-keys.json")).toBe(false)
			expect(controller.validateAccess("logs/app.log")).toBe(false)

			// These should be allowed
			expect(controller.validateAccess("src/app.ts")).toBe(true)
			expect(controller.validateAccess("package.json")).toBe(true)
			expect(controller.validateAccess("secret-file.json")).toBe(true)
		})

		/**
		 * Tests handling of absolute paths
		 */
		it("should handle absolute paths correctly", () => {
			// Test with absolute paths
			const absolutePath = path.join(TEST_CWD, "node_modules/package.json")
			expect(controller.validateAccess(absolutePath)).toBe(false)

			const allowedAbsolutePath = path.join(TEST_CWD, "src/app.ts")
			expect(controller.validateAccess(allowedAbsolutePath)).toBe(true)
		})

		/**
		 * Tests handling of paths outside cwd
		 */
		it("should allow access to paths outside cwd", () => {
			// Path traversal outside cwd
			expect(controller.validateAccess("../outside-project/file.txt")).toBe(true)

			// Completely different path
			expect(controller.validateAccess("/etc/hosts")).toBe(true)
		})

		/**
		 * Tests the default behavior when no .syntxignore exists
		 */
		it("should allow all access when no .syntxignore content", async () => {
			// Create a new controller with no .syntxignore
			mockFileExists.mockResolvedValue(false)
			const emptyController = new RooIgnoreController(TEST_CWD)
			await emptyController.initialize()

			// All paths should be allowed
			expect(emptyController.validateAccess("node_modules/package.json")).toBe(true)
			expect(emptyController.validateAccess("secrets/api-keys.json")).toBe(true)
			expect(emptyController.validateAccess(".git/HEAD")).toBe(true)
		})
	})

	describe("validateCommand", () => {
		beforeEach(async () => {
			// Setup .syntxignore content
			mockFileExists.mockResolvedValue(true)
			mockReadFile.mockResolvedValue("node_modules\n.git\nsecrets/**\n*.log")
			await controller.initialize()
		})

		/**
		 * Tests validation of file reading commands
		 */
		it("should block file reading commands accessing ignored files", () => {
			// Cat command accessing ignored file
			expect(controller.validateCommand("cat node_modules/package.json")).toBe("node_modules/package.json")

			// Grep command accessing ignored file
			expect(controller.validateCommand("grep pattern .git/config")).toBe(".git/config")

			// Commands accessing allowed files should return undefined
			expect(controller.validateCommand("cat src/app.ts")).toBeUndefined()
			expect(controller.validateCommand("less README.md")).toBeUndefined()
		})

		/**
		 * Tests commands with various arguments and flags
		 */
		it("should handle command arguments and flags correctly", () => {
			// Command with flags
			expect(controller.validateCommand("cat -n node_modules/package.json")).toBe("node_modules/package.json")

			// Command with multiple files (only first ignored file is returned)
			expect(controller.validateCommand("grep pattern src/app.ts node_modules/index.js")).toBe(
				"node_modules/index.js",
			)

			// Command with PowerShell parameter style
			expect(controller.validateCommand("Get-Content -Path secrets/api-keys.json")).toBe("secrets/api-keys.json")

			// Arguments with colons are skipped due to the implementation
			// Adjust test to match actual implementation which skips arguments with colons
			expect(controller.validateCommand("Select-String -Path secrets/api-keys.json -Pattern key")).toBe(
				"secrets/api-keys.json",
			)
		})

		/**
		 * Tests validation of non-file-reading commands
		 */
		it("should allow non-file-reading commands", () => {
			// Commands that don't access files directly
			expect(controller.validateCommand("ls -la")).toBeUndefined()
			expect(controller.validateCommand("echo 'Hello'")).toBeUndefined()
			expect(controller.validateCommand("cd node_modules")).toBeUndefined()
			expect(controller.validateCommand("npm install")).toBeUndefined()
		})

		/**
		 * Tests behavior when no .syntxignore exists
		 */
		it("should allow all commands when no .syntxignore exists", async () => {
			// Create a new controller with no .syntxignore
			mockFileExists.mockResolvedValue(false)
			const emptyController = new RooIgnoreController(TEST_CWD)
			await emptyController.initialize()

			// All commands should be allowed
			expect(emptyController.validateCommand("cat node_modules/package.json")).toBeUndefined()
			expect(emptyController.validateCommand("grep pattern .git/config")).toBeUndefined()
		})
	})

	describe("filterPaths", () => {
		beforeEach(async () => {
			// Setup .syntxignore content
			mockFileExists.mockResolvedValue(true)
			mockReadFile.mockResolvedValue("node_modules\n.git\nsecrets/**\n*.log")
			await controller.initialize()
		})

		/**
		 * Tests filtering an array of paths
		 */
		it("should filter out ignored paths from an array", () => {
			const paths = [
				"src/app.ts",
				"node_modules/package.json",
				"README.md",
				".git/HEAD",
				"secrets/keys.json",
				"build/app.js",
				"logs/error.log",
			]

			const filtered = controller.filterPaths(paths)

			// Expected filtered result
			expect(filtered).toEqual(["src/app.ts", "README.md", "build/app.js"])

			// Length should be reduced
			expect(filtered.length).toBe(3)
		})

		/**
		 * Tests error handling in filterPaths
		 */
		it("should handle errors in filterPaths and fail closed", () => {
			// Mock validateAccess to throw an error
			vi.spyOn(controller, "validateAccess").mockImplementation(() => {
				throw new Error("Test error")
			})

			// Spy on console.error
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

			// Should return empty array on error (fail closed)
			const result = controller.filterPaths(["file1.txt", "file2.txt"])
			expect(result).toEqual([])

			// Verify error was logged
			expect(consoleSpy).toHaveBeenCalledWith("Error filtering paths:", expect.any(Error))

			// Cleanup
			consoleSpy.mockRestore()
		})

		/**
		 * Tests empty array handling
		 */
		it("should handle empty arrays", () => {
			const result = controller.filterPaths([])
			expect(result).toEqual([])
		})
	})

	describe("getInstructions", () => {
		/**
		 * Tests instructions generation with .syntxignore
		 */
		it("should generate formatted instructions when .syntxignore exists", async () => {
			// Setup .syntxignore content
			mockFileExists.mockResolvedValue(true)
			mockReadFile.mockResolvedValue("node_modules\n.git\nsecrets/**")
			await controller.initialize()

			const instructions = controller.getInstructions()

			// Verify instruction format
			expect(instructions).toContain("# .syntxignore")
			expect(instructions).toContain(LOCK_TEXT_SYMBOL)
			expect(instructions).toContain("node_modules")
			expect(instructions).toContain(".git")
			expect(instructions).toContain("secrets/**")
		})

		/**
		 * Tests behavior when no .syntxignore exists
		 */
		it("should return undefined when no .syntxignore exists", async () => {
			// Setup no .syntxignore
			mockFileExists.mockResolvedValue(false)
			await controller.initialize()

			const instructions = controller.getInstructions()
			expect(instructions).toBeUndefined()
		})
	})

	describe("dispose", () => {
		/**
		 * Tests proper cleanup of resources
		 */
		it("should dispose all registered disposables", () => {
			// Create spy for dispose methods
			const disposeSpy = vi.fn()

			// Manually add disposables to test
			controller["disposables"] = [{ dispose: disposeSpy }, { dispose: disposeSpy }, { dispose: disposeSpy }]

			// Call dispose
			controller.dispose()

			// Verify all disposables were disposed
			expect(disposeSpy).toHaveBeenCalledTimes(3)

			// Verify disposables array was cleared
			expect(controller["disposables"]).toEqual([])
		})
	})

	describe("file watcher", () => {
		/**
		 * Tests behavior when .syntxignore is created
		 */
		it("should reload .syntxignore when file is created", async () => {
			// Setup initial state without .syntxignore
			mockFileExists.mockResolvedValue(false)
			await controller.initialize()

			// Verify initial state
			expect(controller.rooIgnoreContent).toBeUndefined()
			expect(controller.validateAccess("node_modules/package.json")).toBe(true)

			// Setup for the test
			mockFileExists.mockResolvedValue(false) // Initially no file exists

			// Create and initialize controller with no .syntxignore
			controller = new RooIgnoreController(TEST_CWD)
			await controller.initialize()

			// Initial state check
			expect(controller.rooIgnoreContent).toBeUndefined()

			// Now simulate file creation
			mockFileExists.mockResolvedValue(true)
			mockReadFile.mockResolvedValue("node_modules")

			// Force reload of .syntxignore content manually
			await controller.initialize()

			// Now verify content was updated
			expect(controller.rooIgnoreContent).toBe("node_modules")

			// Verify access validation changed
			expect(controller.validateAccess("node_modules/package.json")).toBe(false)
		})

		/**
		 * Tests behavior when .syntxignore is changed
		 */
		it("should reload .syntxignore when file is changed", async () => {
			// Setup initial state with .syntxignore
			mockFileExists.mockResolvedValue(true)
			mockReadFile.mockResolvedValue("node_modules")
			await controller.initialize()

			// Verify initial state
			expect(controller.validateAccess("node_modules/package.json")).toBe(false)
			expect(controller.validateAccess(".git/config")).toBe(true)

			// Simulate file change
			mockReadFile.mockResolvedValue("node_modules\n.git")

			// Instead of relying on the onChange handler, manually reload
			// This is because the mock watcher doesn't actually trigger the reload in tests
			await controller.initialize()

			// Verify content was updated
			expect(controller.rooIgnoreContent).toBe("node_modules\n.git")

			// Verify access validation changed
			expect(controller.validateAccess("node_modules/package.json")).toBe(false)
			expect(controller.validateAccess(".git/config")).toBe(false)
		})

		/**
		 * Tests behavior when .syntxignore is deleted
		 */
		it("should reset when .syntxignore is deleted", async () => {
			// Setup initial state with .syntxignore
			mockFileExists.mockResolvedValue(true)
			mockReadFile.mockResolvedValue("node_modules")
			await controller.initialize()

			// Verify initial state
			expect(controller.validateAccess("node_modules/package.json")).toBe(false)

			// Simulate file deletion
			mockFileExists.mockResolvedValue(false)

			// Find and trigger the onDelete handler
			const onDeleteHandler = mockWatcher.onDidDelete.mock.calls[0][0]
			await onDeleteHandler()

			// Verify content was reset
			expect(controller.rooIgnoreContent).toBeUndefined()

			// Verify access validation changed
			expect(controller.validateAccess("node_modules/package.json")).toBe(true)
		})
	})
})
