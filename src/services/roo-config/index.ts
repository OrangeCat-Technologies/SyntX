import * as path from "path"
import * as os from "os"
import fs from "fs/promises"

/**
 * Gets the global .syntx directory path based on the current platform
 *
 * @returns The absolute path to the global .syntx directory
 *
 * @example Platform-specific paths:
 * ```
 * // macOS/Linux: ~/.syntx/
 * // Example: /Users/john/.syntx
 *
 * // Windows: %USERPROFILE%\.syntx\
 * // Example: C:\Users\john\.syntx
 * ```
 *
 * @example Usage:
 * ```typescript
 * const globalDir = getGlobalSyntXDirectory()
 * // Returns: "/Users/john/.syntx" (on macOS/Linux)
 * // Returns: "C:\\Users\\john\\.syntx" (on Windows)
 * ```
 */
export function getGlobalSyntXDirectory(): string {
	const homeDir = os.homedir()
	return path.join(homeDir, ".syntx")
}

/**
 * Gets the project-local .syntx directory path for a given cwd
 *
 * @param cwd - Current working directory (project path)
 * @returns The absolute path to the project-local .syntx directory
 *
 * @example
 * ```typescript
 * const projectDir = getProjectSyntXDirectoryForCwd('/Users/john/my-project')
 * // Returns: "/Users/john/my-project/.syntx"
 *
 * const windowsProjectDir = getProjectSyntXDirectoryForCwd('C:\\Users\\john\\my-project')
 * // Returns: "C:\\Users\\john\\my-project\\.syntx"
 * ```
 *
 * @example Directory structure:
 * ```
 * /Users/john/my-project/
 * ├── .syntx/                    # Project-local configuration directory
 * │   ├── rules/
 * │   │   └── rules.md
 * │   ├── custom-instructions.md
 * │   └── config/
 * │       └── settings.json
 * ├── src/
 * │   └── index.ts
 * └── package.json
 * ```
 */
export function getProjectSyntXDirectoryForCwd(cwd: string): string {
	return path.join(cwd, ".syntx")
}

/**
 * Checks if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
	try {
		const stat = await fs.stat(dirPath)
		return stat.isDirectory()
	} catch (error: any) {
		// Only catch expected "not found" errors
		if (error.code === "ENOENT" || error.code === "ENOTDIR") {
			return false
		}
		// Re-throw unexpected errors (permission, I/O, etc.)
		throw error
	}
}

/**
 * Checks if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
	try {
		const stat = await fs.stat(filePath)
		return stat.isFile()
	} catch (error: any) {
		// Only catch expected "not found" errors
		if (error.code === "ENOENT" || error.code === "ENOTDIR") {
			return false
		}
		// Re-throw unexpected errors (permission, I/O, etc.)
		throw error
	}
}

/**
 * Reads a file safely, returning null if it doesn't exist
 */
export async function readFileIfExists(filePath: string): Promise<string | null> {
	try {
		return await fs.readFile(filePath, "utf-8")
	} catch (error: any) {
		// Only catch expected "not found" errors
		if (error.code === "ENOENT" || error.code === "ENOTDIR" || error.code === "EISDIR") {
			return null
		}
		// Re-throw unexpected errors (permission, I/O, etc.)
		throw error
	}
}

/**
 * Gets the ordered list of .syntx directories to check (global first, then project-local)
 *
 * @param cwd - Current working directory (project path)
 * @returns Array of directory paths to check in order [global, project-local]
 *
 * @example
 * ```typescript
 * // For a project at /Users/john/my-project
 * const directories = getSyntXDirectoriesForCwd('/Users/john/my-project')
 * // Returns:
 * // [
 * //   '/Users/john/.syntx',           // Global directory
 * //   '/Users/john/my-project/.syntx' // Project-local directory
 * // ]
 * ```
 *
 * @example Directory structure:
 * ```
 * /Users/john/
 * ├── .syntx/                    # Global configuration
 * │   ├── rules/
 * │   │   └── rules.md
 * │   └── custom-instructions.md
 * └── my-project/
 *     ├── .syntx/                # Project-specific configuration
 *     │   ├── rules/
 *     │   │   └── rules.md     # Overrides global rules
 *     │   └── project-notes.md
 *     └── src/
 *         └── index.ts
 * ```
 */
export function getSyntXDirectoriesForCwd(cwd: string): string[] {
	const directories: string[] = []

	// Add global directory first
	directories.push(getGlobalSyntXDirectory())

	// Add project-local directory second
	directories.push(getProjectSyntXDirectoryForCwd(cwd))

	return directories
}

/**
 * Loads configuration from multiple .syntx directories with project overriding global
 *
 * @param relativePath - The relative path within each .syntx directory (e.g., 'rules/rules.md')
 * @param cwd - Current working directory (project path)
 * @returns Object with global and project content, plus merged content
 *
 * @example
 * ```typescript
 * // Load rules configuration for a project
 * const config = await loadConfiguration('rules/rules.md', '/Users/john/my-project')
 *
 * // Returns:
 * // {
 * //   global: "Global rules content...",     // From ~/.syntx/rules/rules.md
 * //   project: "Project rules content...",   // From /Users/john/my-project/.syntx/rules/rules.md
 * //   merged: "Global rules content...\n\n# Project-specific rules (override global):\n\nProject rules content..."
 * // }
 * ```
 *
 * @example File paths resolved:
 * ```
 * relativePath: 'rules/rules.md'
 * cwd: '/Users/john/my-project'
 *
 * Reads from:
 * - Global: /Users/john/.syntx/rules/rules.md
 * - Project: /Users/john/my-project/.syntx/rules/rules.md
 *
 * Other common relativePath examples:
 * - 'custom-instructions.md'
 * - 'config/settings.json'
 * - 'templates/component.tsx'
 * ```
 *
 * @example Merging behavior:
 * ```
 * // If only global exists:
 * { global: "content", project: null, merged: "content" }
 *
 * // If only project exists:
 * { global: null, project: "content", merged: "content" }
 *
 * // If both exist:
 * {
 *   global: "global content",
 *   project: "project content",
 *   merged: "global content\n\n# Project-specific rules (override global):\n\nproject content"
 * }
 * ```
 */
export async function loadConfiguration(
	relativePath: string,
	cwd: string,
): Promise<{
	global: string | null
	project: string | null
	merged: string
}> {
	const globalDir = getGlobalSyntXDirectory()
	const projectDir = getProjectSyntXDirectoryForCwd(cwd)

	const globalFilePath = path.join(globalDir, relativePath)
	const projectFilePath = path.join(projectDir, relativePath)

	// Read global configuration
	const globalContent = await readFileIfExists(globalFilePath)

	// Read project-local configuration
	const projectContent = await readFileIfExists(projectFilePath)

	// Merge configurations - project overrides global
	let merged = ""

	if (globalContent) {
		merged += globalContent
	}

	if (projectContent) {
		if (merged) {
			merged += "\n\n# Project-specific rules (override global):\n\n"
		}
		merged += projectContent
	}

	return {
		global: globalContent,
		project: projectContent,
		merged: merged || "",
	}
}

// Export with backward compatibility alias
export const loadSyntXConfiguration: typeof loadConfiguration = loadConfiguration
// Keep old alias for backward compatibility
export const loadRooConfiguration: typeof loadConfiguration = loadConfiguration

// Add backward compatibility functions
export const getGlobalRooDirectory = getGlobalSyntXDirectory
export const getProjectRooDirectoryForCwd = getProjectSyntXDirectoryForCwd
export const getRooDirectoriesForCwd = getSyntXDirectoriesForCwd
