import * as vscode from "vscode"
import * as path from "path"

import { listFiles } from "../../services/glob/list-files"
import { ClineProvider } from "../../core/webview/ClineProvider"
import { toRelativePath, getWorkspacePath, getAllWorkspaceFolders, getWorkspaceFolderForPath } from "../../utils/path"

const MAX_INITIAL_FILES = 1_000

// Note: this is not a drop-in replacement for listFiles at the start of tasks, since that will be done for Desktops when there is no workspace selected
class WorkspaceTracker {
	private providerRef: WeakRef<ClineProvider>
	private disposables: vscode.Disposable[] = []
	private filePaths: Set<string> = new Set()
	private updateTimer: NodeJS.Timeout | null = null
	private prevWorkSpacePath: string | undefined
	private resetTimer: NodeJS.Timeout | null = null

	get cwd() {
		return getWorkspacePath()
	}
	constructor(provider: ClineProvider) {
		this.providerRef = new WeakRef(provider)
		this.registerListeners()
	}

	async initializeFilePaths() {
		const allWorkspaceFolders = getAllWorkspaceFolders()
		if (allWorkspaceFolders.length === 0) {
			return
		}

		this.filePaths.clear()
		for (const workspaceFolder of allWorkspaceFolders) {
			const [files] = await listFiles(workspaceFolder, true, MAX_INITIAL_FILES)
			files.forEach((file) => this.filePaths.add(this.normalizeFilePath(file)))
		}
		this.workspaceDidUpdate()
	}

	private registerListeners() {
		const watcher = vscode.workspace.createFileSystemWatcher("**")
		this.prevWorkSpacePath = this.cwd
		this.disposables.push(
			watcher.onDidCreate(async (uri) => {
				await this.addFilePath(uri.fsPath)
				this.workspaceDidUpdate()
			}),
		)

		// Renaming files triggers a delete and create event
		this.disposables.push(
			watcher.onDidDelete(async (uri) => {
				if (await this.removeFilePath(uri.fsPath)) {
					this.workspaceDidUpdate()
				}
			}),
		)

		this.disposables.push(watcher)

		// Listen for tab changes and call workspaceDidUpdate directly
		this.disposables.push(
			vscode.window.tabGroups.onDidChangeTabs(() => {
				// Reset if workspace path has changed
				if (this.prevWorkSpacePath !== this.cwd) {
					this.workspaceDidReset()
				} else {
					// Otherwise just update
					this.workspaceDidUpdate()
				}
			}),
		)
	}

	private getOpenedTabsInfo() {
		const allWorkspaceFolders = getAllWorkspaceFolders()
		return vscode.window.tabGroups.all.reduce(
			(acc, group) => {
				const groupTabs = group.tabs
					.filter((tab) => tab.input instanceof vscode.TabInputText)
					.map((tab) => {
						const fsPath = (tab.input as vscode.TabInputText).uri.fsPath
						const workspaceFolder = getWorkspaceFolderForPath(fsPath)
						let relativePath = toRelativePath(fsPath, workspaceFolder)

						// For multi-folder workspaces, prefix with folder name
						if (allWorkspaceFolders.length > 1) {
							const folderName = path.basename(workspaceFolder)
							// Only add folder name prefix if the relative path doesn't already start with it
							if (!relativePath.startsWith(folderName + path.sep)) {
								relativePath = path.join(folderName, relativePath)
							}
						}
						return {
							label: tab.label,
							isActive: tab.isActive,
							path: relativePath,
						}
					})

				groupTabs.forEach((tab) => (tab.isActive ? acc.unshift(tab) : acc.push(tab)))
				return acc
			},
			[] as Array<{ label: string; isActive: boolean; path: string }>,
		)
	}

	private async workspaceDidReset() {
		if (this.resetTimer) {
			clearTimeout(this.resetTimer)
		}
		this.resetTimer = setTimeout(async () => {
			if (this.prevWorkSpacePath !== this.cwd) {
				await this.providerRef.deref()?.postMessageToWebview({
					type: "workspaceUpdated",
					filePaths: [],
					openedTabs: this.getOpenedTabsInfo(),
				})
				this.filePaths.clear()
				this.prevWorkSpacePath = this.cwd
				this.initializeFilePaths()
			}
		}, 300) // Debounce for 300ms
	}

	private workspaceDidUpdate() {
		if (this.updateTimer) {
			clearTimeout(this.updateTimer)
		}
		this.updateTimer = setTimeout(() => {
			const allWorkspaceFolders = getAllWorkspaceFolders()
			if (allWorkspaceFolders.length === 0 && this.filePaths.size === 0) {
				return
			}

			const relativeFilePaths = Array.from(this.filePaths).map((file) => {
				const workspaceFolder = getWorkspaceFolderForPath(file)
				let relativePath = toRelativePath(file, workspaceFolder)

				// For multi-folder workspaces, prefix with folder name
				if (allWorkspaceFolders.length > 1) {
					const folderName = path.basename(workspaceFolder)
					// Only add folder name prefix if the relative path doesn't already start with it
					if (!relativePath.startsWith(folderName + path.sep)) {
						relativePath = path.join(folderName, relativePath)
					}
				}
				return relativePath
			})

			this.providerRef.deref()?.postMessageToWebview({
				type: "workspaceUpdated",
				filePaths: relativeFilePaths,
				openedTabs: this.getOpenedTabsInfo(),
			})
			this.updateTimer = null
		}, 300) // Debounce for 300ms
	}

	private normalizeFilePath(filePath: string): string {
		// If the file path is already absolute, return it as is
		if (path.isAbsolute(filePath)) {
			return filePath.endsWith("/") ? filePath : filePath
		}

		// For relative paths, try to determine the appropriate workspace folder
		const allWorkspaceFolders = getAllWorkspaceFolders()

		// If we have multiple workspace folders, try to match the path to a folder
		if (allWorkspaceFolders.length > 1) {
			const pathParts = filePath.split(path.sep)
			const firstPart = pathParts[0]

			// Check if the first part matches any workspace folder name
			for (const workspaceFolder of allWorkspaceFolders) {
				const folderName = path.basename(workspaceFolder)
				if (firstPart === folderName) {
					// Remove the folder name from the path and join with the workspace folder
					const remainingPath = pathParts.slice(1).join(path.sep)
					const normalizedPath = path.join(workspaceFolder, remainingPath)
					return filePath.endsWith("/") ? normalizedPath + "/" : normalizedPath
				}
			}
		}

		// Fall back to the first workspace folder
		const workspaceFolder = getWorkspaceFolderForPath(filePath)
		const normalizedPath = path.join(workspaceFolder, filePath)
		return filePath.endsWith("/") ? normalizedPath + "/" : normalizedPath
	}

	private async addFilePath(filePath: string): Promise<string> {
		// Allow for some buffer to account for files being created/deleted during a task
		if (this.filePaths.size >= MAX_INITIAL_FILES * 2) {
			return filePath
		}

		const normalizedPath = this.normalizeFilePath(filePath)
		try {
			const stat = await vscode.workspace.fs.stat(vscode.Uri.file(normalizedPath))
			const isDirectory = (stat.type & vscode.FileType.Directory) !== 0
			const pathWithSlash = isDirectory && !normalizedPath.endsWith("/") ? normalizedPath + "/" : normalizedPath
			this.filePaths.add(pathWithSlash)
			return pathWithSlash
		} catch {
			// If stat fails, assume it's a file (this can happen for newly created files)
			this.filePaths.add(normalizedPath)
			return normalizedPath
		}
	}

	private async removeFilePath(filePath: string): Promise<boolean> {
		const normalizedPath = this.normalizeFilePath(filePath)
		return this.filePaths.delete(normalizedPath) || this.filePaths.delete(normalizedPath + "/")
	}

	public dispose() {
		if (this.updateTimer) {
			clearTimeout(this.updateTimer)
			this.updateTimer = null
		}
		if (this.resetTimer) {
			clearTimeout(this.resetTimer)
			this.resetTimer = null
		}
		this.disposables.forEach((d) => d.dispose())
		this.disposables = [] // Clear the array
	}
}

export default WorkspaceTracker
