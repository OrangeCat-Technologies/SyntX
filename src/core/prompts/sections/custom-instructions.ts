import fs from "fs/promises"
import path from "path"
import * as os from "os"
import { Dirent } from "fs"

import { isLanguage } from "@roo-code/types"

import { LANGUAGES } from "../../../shared/language"
import {
	getSyntXDirectoriesForCwd,
	getGlobalSyntXDirectory,
	getRooDirectoriesForCwd,
} from "../../../services/roo-config"

/**
 * Safely read a file and return its trimmed content
 */
async function safeReadFile(filePath: string): Promise<string> {
	try {
		const content = await fs.readFile(filePath, "utf-8")
		return content.trim()
	} catch (err) {
		const errorCode = (err as NodeJS.ErrnoException).code
		if (!errorCode || !["ENOENT", "EISDIR"].includes(errorCode)) {
			throw err
		}
		return ""
	}
}

/**
 * Check if a directory exists
 */
async function directoryExists(dirPath: string): Promise<boolean> {
	try {
		const stats = await fs.stat(dirPath)
		return stats.isDirectory()
	} catch (err) {
		return false
	}
}

const MAX_DEPTH = 5

/**
 * Recursively resolve directory entries and collect file paths
 */
async function resolveDirectoryEntry(
	entry: Dirent,
	dirPath: string,
	filePaths: string[],
	depth: number,
): Promise<void> {
	// Avoid cyclic symlinks
	if (depth > MAX_DEPTH) {
		return
	}

	const fullPath = path.resolve(entry.parentPath || dirPath, entry.name)
	if (entry.isFile()) {
		// Regular file
		filePaths.push(fullPath)
	} else if (entry.isSymbolicLink()) {
		// Await the resolution of the symbolic link
		await resolveSymLink(fullPath, filePaths, depth + 1)
	}
}

/**
 * Recursively resolve a symbolic link and collect file paths
 */
async function resolveSymLink(fullPath: string, filePaths: string[], depth: number): Promise<void> {
	// Avoid cyclic symlinks
	if (depth > MAX_DEPTH) {
		return
	}
	try {
		// Get the symlink target
		const linkTarget = await fs.readlink(fullPath)
		// Resolve the target path (relative to the symlink location)
		const resolvedTarget = path.resolve(path.dirname(fullPath), linkTarget)

		// Check if the target is a file
		const stats = await fs.stat(resolvedTarget)
		if (stats.isFile()) {
			filePaths.push(resolvedTarget)
		} else if (stats.isDirectory()) {
			const anotherEntries = await fs.readdir(resolvedTarget, { withFileTypes: true, recursive: true })
			// Collect promises for recursive calls within the directory
			const directoryPromises: Promise<void>[] = []
			for (const anotherEntry of anotherEntries) {
				directoryPromises.push(resolveDirectoryEntry(anotherEntry, resolvedTarget, filePaths, depth + 1))
			}
			// Wait for all entries in the resolved directory to be processed
			await Promise.all(directoryPromises)
		} else if (stats.isSymbolicLink()) {
			// Handle nested symlinks by awaiting the recursive call
			await resolveSymLink(resolvedTarget, filePaths, depth + 1)
		}
	} catch (err) {
		// Skip invalid symlinks
	}
}

/**
 * Read all text files from a directory in alphabetical order
 */
async function readTextFilesFromDirectory(dirPath: string): Promise<Array<{ filename: string; content: string }>> {
	try {
		const entries = await fs.readdir(dirPath, { withFileTypes: true, recursive: true })

		// Process all entries - regular files and symlinks that might point to files
		const filePaths: string[] = []
		// Collect promises for the initial resolution calls
		const initialPromises: Promise<void>[] = []

		for (const entry of entries) {
			initialPromises.push(resolveDirectoryEntry(entry, dirPath, filePaths, 0))
		}

		// Wait for all asynchronous operations (including recursive ones) to complete
		await Promise.all(initialPromises)

		const fileContents = await Promise.all(
			filePaths.map(async (file) => {
				try {
					// Check if it's a file (not a directory)
					const stats = await fs.stat(file)
					if (stats.isFile()) {
						// Filter out cache files and system files that shouldn't be in rules
						if (!shouldIncludeRuleFile(file)) {
							return null
						}
						const content = await safeReadFile(file)
						return { filename: file, content }
					}
					return null
				} catch (err) {
					return null
				}
			}),
		)

		// Filter out null values (directories, failed reads, or excluded files)
		return fileContents.filter((item): item is { filename: string; content: string } => item !== null)
	} catch (err) {
		return []
	}
}

/**
 * Format content from multiple files with filenames as headers
 */
function formatDirectoryContent(dirPath: string, files: Array<{ filename: string; content: string }>): string {
	if (files.length === 0) return ""

	return files
		.map((file) => {
			return `# Rules from ${file.filename}:\n${file.content}`
		})
		.join("\n\n")
}

/**
 * Get ordered list of directories to check for rules (both .syntx and .roo)
 * Returns array in priority order: [global .syntx, project .syntx, global .roo, project .roo]
 */
function getSyntxAndRooDirectoriesForCwd(cwd: string): Array<{ path: string; type: "syntx" | "roo" }> {
	const directories: Array<{ path: string; type: "syntx" | "roo" }> = []
	const homeDir = require("os").homedir()

	// Add .syntx directories first (higher priority)
	directories.push({ path: path.join(homeDir, ".syntx"), type: "syntx" })
	directories.push({ path: path.join(cwd, ".syntx"), type: "syntx" })

	// Add .roo directories for backwards compatibility (lower priority)
	const rooDirectories = getRooDirectoriesForCwd(cwd)
	for (const rooDir of rooDirectories) {
		directories.push({ path: rooDir, type: "roo" })
	}

	return directories
}

/**
 * Load syntx.md project guidance file
 */
async function loadSyntxMd(cwd: string): Promise<string> {
	const syntxMdPath = path.join(cwd, "syntx.md")
	const content = await safeReadFile(syntxMdPath)
	if (content) {
		return `\n# Project Guidance from syntx.md:\n${content}\n`
	}
	return ""
}

/**
 * Load rule files from directories with new priority order:
 * 1. .syntx/rules/ directories (highest priority)
 * 2. .roo/rules/ directories (legacy, lower priority)
 * 3. Legacy single files: .syntxrules > .roorules > .clinerules
 */
export async function loadRuleFiles(cwd: string): Promise<string> {
	const rules: string[] = []
	const directories = getSyntxAndRooDirectoriesForCwd(cwd)

	// Check for rules/ directories in priority order
	for (const { path: dirPath, type } of directories) {
		const rulesDir = path.join(dirPath, "rules")
		if (await directoryExists(rulesDir)) {
			const files = await readTextFilesFromDirectory(rulesDir)
			if (files.length > 0) {
				const content = formatDirectoryContent(rulesDir, files)
				rules.push(content)
			}
		}
	}

	// If we found rules in directories, return them
	if (rules.length > 0) {
		return "\n" + rules.join("\n\n")
	}

	// Fall back to single rule files with new priority order
	const ruleFiles = [".syntxrules", ".roorules", ".clinerules"]

	for (const file of ruleFiles) {
		const content = await safeReadFile(path.join(cwd, file))
		if (content) {
			return `\n# Rules from ${file}:\n${content}\n`
		}
	}

	return ""
}

export async function addCustomInstructions(
	modeCustomInstructions: string,
	globalCustomInstructions: string,
	cwd: string,
	mode: string,
	options: { language?: string; rooIgnoreInstructions?: string } = {},
): Promise<string> {
	const sections = []

	// Load mode-specific rules if mode is provided
	let modeRuleContent = ""
	let usedRuleFile = ""

	if (mode) {
		const modeRules: string[] = []
		const directories = getSyntxAndRooDirectoriesForCwd(cwd)

		// Check for rules-${mode}/ directories in priority order (.syntx first, then .roo)
		for (const { path: dirPath, type } of directories) {
			const modeRulesDir = path.join(dirPath, `rules-${mode}`)
			if (await directoryExists(modeRulesDir)) {
				const files = await readTextFilesFromDirectory(modeRulesDir)
				if (files.length > 0) {
					const content = formatDirectoryContent(modeRulesDir, files)
					modeRules.push(content)
				}
			}
		}

		// If we found mode-specific rules in directories, use them
		if (modeRules.length > 0) {
			modeRuleContent = "\n" + modeRules.join("\n\n")
			usedRuleFile = `rules-${mode} directories`
		} else {
			// Fall back to single rule files with new priority order
			const modeRuleFiles = [`.syntxrules-${mode}`, `.roorules-${mode}`, `.clinerules-${mode}`]

			for (const ruleFile of modeRuleFiles) {
				const content = await safeReadFile(path.join(cwd, ruleFile))
				if (content) {
					modeRuleContent = content
					usedRuleFile = ruleFile
					break
				}
			}
		}
	}

	// Add language preference if provided
	if (options.language) {
		const languageName = isLanguage(options.language) ? LANGUAGES[options.language] : options.language
		sections.push(
			`Language Preference:\nYou should always speak and think in the "${languageName}" (${options.language}) language unless the user gives you instructions below to do otherwise.`,
		)
	}

	// Add global instructions first
	if (typeof globalCustomInstructions === "string" && globalCustomInstructions.trim()) {
		sections.push(`Global Instructions:\n${globalCustomInstructions.trim()}`)
	}

	// Add mode-specific instructions after
	if (typeof modeCustomInstructions === "string" && modeCustomInstructions.trim()) {
		sections.push(`Mode-specific Instructions:\n${modeCustomInstructions.trim()}`)
	}

	// Add rules - include both mode-specific and generic rules if they exist
	const rules = []

	// Add mode-specific rules first if they exist
	if (modeRuleContent && modeRuleContent.trim()) {
		if (
			usedRuleFile.includes(path.join(".syntx", `rules-${mode}`)) ||
			usedRuleFile.includes(path.join(".roo", `rules-${mode}`))
		) {
			rules.push(modeRuleContent.trim())
		} else {
			rules.push(`# Rules from ${usedRuleFile}:\n${modeRuleContent}`)
		}
	}

	// Add project guidance from syntx.md
	const syntxMdContent = await loadSyntxMd(cwd)
	if (syntxMdContent && syntxMdContent.trim()) {
		rules.push(syntxMdContent.trim())
	}

	if (options.rooIgnoreInstructions) {
		rules.push(options.rooIgnoreInstructions)
	}

	// Add generic rules
	const genericRuleContent = await loadRuleFiles(cwd)
	if (genericRuleContent && genericRuleContent.trim()) {
		rules.push(genericRuleContent.trim())
	}

	if (rules.length > 0) {
		sections.push(`Rules:\n\n${rules.join("\n\n")}`)
	}

	const joinedSections = sections.join("\n\n")

	return joinedSections
		? `
====

USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

${joinedSections}`
		: ""
}

/**
 * Check if a file should be included in rule compilation.
 * Excludes cache files and system files that shouldn't be processed as rules.
 */
function shouldIncludeRuleFile(filename: string): boolean {
	const basename = path.basename(filename)

	const cachePatterns = [
		"*.DS_Store",
		"*.bak",
		"*.cache",
		"*.crdownload",
		"*.db",
		"*.dmp",
		"*.dump",
		"*.eslintcache",
		"*.lock",
		"*.log",
		"*.old",
		"*.part",
		"*.partial",
		"*.pyc",
		"*.pyo",
		"*.stackdump",
		"*.swo",
		"*.swp",
		"*.temp",
		"*.tmp",
		"Thumbs.db",
	]

	return !cachePatterns.some((pattern) => {
		if (pattern.startsWith("*.")) {
			const extension = pattern.slice(1)
			return basename.endsWith(extension)
		} else {
			return basename === pattern
		}
	})
}
