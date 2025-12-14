import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

import {
	type ProviderSettings,
	type ProviderSettingsEntry,
	type CustomModePrompts,
	type ModeConfig,
	type ExperimentId,
	type OrganizationAllowList,
	ORGANIZATION_ALLOW_ALL,
} from "@roo-code/types"

import { ExtensionMessage, ExtensionState, MarketplaceInstalledMetadata } from "@roo/ExtensionMessage"
import { findLastIndex } from "@roo/array"
import { McpServer } from "@roo/mcp"
import { checkExistKey } from "@roo/checkExistApiConfig"
import { Mode, defaultModeSlug, defaultPrompts } from "@roo/modes"
import { CustomSupportPrompts } from "@roo/support-prompt"
import { experimentDefault } from "@roo/experiments"
import { TelemetrySetting } from "@roo/TelemetrySetting"
import { RouterModels } from "@roo/api"

import { vscode } from "@src/utils/vscode"
import { convertTextMateToHljs } from "@src/utils/textMateToHljs"

export interface ExtensionStateContextType extends ExtensionState {
	showModes?: boolean
	showAnthropicApiKeyScreen?: boolean
	historyPreviewCollapsed?: boolean // Add the new state property
	didHydrateState: boolean
	showWelcome: boolean
	theme: any
	mcpServers: McpServer[]
	hasSystemPromptOverride?: boolean
	currentCheckpoint?: string
	filePaths: string[]
	openedTabs: Array<{ label: string; isActive: boolean; path?: string }>
	organizationAllowList: OrganizationAllowList
	cloudIsAuthenticated: boolean
	sharingEnabled: boolean
	// Website authentication properties
	websiteUsername?: string
	syntxApiKey?: string
	websiteNotAuthenticated?: boolean
	maxConcurrentFileReads?: number
	mdmCompliant?: boolean
	hasOpenedModeSelector: boolean // New property to track if user has opened mode selector
	setHasOpenedModeSelector: (value: boolean) => void // Setter for the new property
	alwaysAllowFollowupQuestions: boolean // New property for follow-up questions auto-approve
	setAlwaysAllowFollowupQuestions: (value: boolean) => void // Setter for the new property
	followupAutoApproveTimeoutMs: number | undefined // Timeout in ms for auto-approving follow-up questions
	setFollowupAutoApproveTimeoutMs: (value: number) => void // Setter for the timeout
	condensingApiConfigId?: string
	setCondensingApiConfigId: (value: string) => void
	customCondensingPrompt?: string
	setCustomCondensingPrompt: (value: string) => void
	marketplaceItems?: any[]
	marketplaceInstalledMetadata?: MarketplaceInstalledMetadata
	profileThresholds: Record<string, number>
	setProfileThresholds: (value: Record<string, number>) => void
	setApiConfiguration: (config: ProviderSettings) => void
	setCustomInstructions: (value?: string) => void
	setAlwaysAllowReadOnly: (value: boolean) => void
	setAlwaysAllowReadOnlyOutsideWorkspace: (value: boolean) => void
	setAlwaysAllowWrite: (value: boolean) => void
	setAlwaysAllowWriteOutsideWorkspace: (value: boolean) => void
	setAlwaysAllowExecute: (value: boolean) => void
	setAlwaysAllowBrowser: (value: boolean) => void
	setAlwaysAllowMcp: (value: boolean) => void
	setAlwaysAllowModeSwitch: (value: boolean) => void
	setAlwaysAllowSubtasks: (value: boolean) => void
	setBrowserToolEnabled: (value: boolean) => void
	setShowRooIgnoredFiles: (value: boolean) => void
	setShowAnnouncement: (value: boolean) => void
	setAllowedCommands: (value: string[]) => void
	setDeniedCommands: (value: string[]) => void
	setAllowedMaxRequests: (value: number | undefined) => void
	setSoundEnabled: (value: boolean) => void
	setSoundVolume: (value: number) => void
	terminalShellIntegrationTimeout?: number
	setTerminalShellIntegrationTimeout: (value: number) => void
	terminalShellIntegrationDisabled?: boolean
	setTerminalShellIntegrationDisabled: (value: boolean) => void
	terminalZdotdir?: boolean
	setTerminalZdotdir: (value: boolean) => void
	setTtsEnabled: (value: boolean) => void
	setTtsSpeed: (value: number) => void
	setDiffEnabled: (value: boolean) => void
	setEnableCheckpoints: (value: boolean) => void
	setBrowserViewportSize: (value: string) => void
	setFuzzyMatchThreshold: (value: number) => void
	setWriteDelayMs: (value: number) => void
	screenshotQuality?: number
	setScreenshotQuality: (value: number) => void
	terminalOutputLineLimit?: number
	setTerminalOutputLineLimit: (value: number) => void
	terminalOutputCharacterLimit?: number
	setTerminalOutputCharacterLimit: (value: number) => void
	mcpEnabled: boolean
	setMcpEnabled: (value: boolean) => void
	enableMcpServerCreation: boolean
	setEnableMcpServerCreation: (value: boolean) => void
	alwaysApproveResubmit?: boolean
	setAlwaysApproveResubmit: (value: boolean) => void
	requestDelaySeconds: number
	setRequestDelaySeconds: (value: number) => void
	setCurrentApiConfigName: (value: string) => void
	setListApiConfigMeta: (value: ProviderSettingsEntry[]) => void
	mode: Mode
	setMode: (value: Mode) => void
	setCustomModePrompts: (value: CustomModePrompts) => void
	setCustomSupportPrompts: (value: CustomSupportPrompts) => void
	enhancementApiConfigId?: string
	setEnhancementApiConfigId: (value: string) => void
	setExperimentEnabled: (id: ExperimentId, enabled: boolean) => void
	setAutoApprovalEnabled: (value: boolean) => void
	customModes: ModeConfig[]
	setCustomModes: (value: ModeConfig[]) => void
	setMaxOpenTabsContext: (value: number) => void
	maxWorkspaceFiles: number
	setMaxWorkspaceFiles: (value: number) => void
	setTelemetrySetting: (value: TelemetrySetting) => void
	remoteBrowserEnabled?: boolean
	setRemoteBrowserEnabled: (value: boolean) => void
	awsUsePromptCache?: boolean
	setAwsUsePromptCache: (value: boolean) => void
	maxReadFileLine: number
	setMaxReadFileLine: (value: number) => void
	machineId?: string
	pinnedApiConfigs?: Record<string, boolean>
	setPinnedApiConfigs: (value: Record<string, boolean>) => void
	togglePinnedApiConfig: (configName: string) => void
	terminalCompressProgressBar?: boolean
	setTerminalCompressProgressBar: (value: boolean) => void
	setHistoryPreviewCollapsed: (value: boolean) => void
	autoCondenseContext: boolean
	setAutoCondenseContext: (value: boolean) => void
	autoCondenseContextPercent: number
	setAutoCondenseContextPercent: (value: number) => void
	routerModels?: RouterModels
	alwaysAllowUpdateTodoList?: boolean
	setAlwaysAllowUpdateTodoList: (value: boolean) => void
	// Multilingual features state
	multilingualEnabled: boolean
	setMultilingualEnabled: (value: boolean) => void
	sarvamApiKey: string
	setSarvamApiKey: (value: string) => void
	multilingualTargetLanguage: string
	setMultilingualTargetLanguage: (value: string) => void
}

export const ExtensionStateContext = createContext<ExtensionStateContextType | undefined>(undefined)

export const mergeExtensionState = (prevState: ExtensionState, newState: ExtensionState) => {
	const { customModePrompts: prevCustomModePrompts, experiments: prevExperiments, ...prevRest } = prevState

	const {
		apiConfiguration,
		customModePrompts: newCustomModePrompts,
		customSupportPrompts,
		experiments: newExperiments,
		...newRest
	} = newState

	const customModePrompts = { ...prevCustomModePrompts, ...newCustomModePrompts }
	const experiments = { ...prevExperiments, ...newExperiments }
	const rest = { ...prevRest, ...newRest }

	// Note that we completely replace the previous apiConfiguration and customSupportPrompts objects
	// with new ones since the state that is broadcast is the entire objects so merging is not necessary.
	return { ...rest, apiConfiguration, customModePrompts, customSupportPrompts, experiments }
}

export const ExtensionStateContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, setState] = useState<ExtensionState & { organizationAllowList?: OrganizationAllowList }>({
		version: "",
		clineMessages: [],
		taskHistory: [],
		shouldShowAnnouncement: false,
		allowedCommands: [],
		deniedCommands: [],
		soundEnabled: false,
		soundVolume: 0.5,
		ttsEnabled: false,
		ttsSpeed: 1.0,
		diffEnabled: false,
		enableCheckpoints: true,
		fuzzyMatchThreshold: 1.0,
		language: "en", // Default language code
		writeDelayMs: 1000,
		browserViewportSize: "900x600",
		screenshotQuality: 75,
		terminalOutputLineLimit: 500,
		terminalOutputCharacterLimit: 50000,
		terminalShellIntegrationTimeout: 4000,
		mcpEnabled: true,
		enableMcpServerCreation: false,
		alwaysApproveResubmit: false,
		requestDelaySeconds: 5,
		currentApiConfigName: "default",
		listApiConfigMeta: [],
		showModes: true,
		mode: defaultModeSlug,
		customModePrompts: defaultPrompts,
		customSupportPrompts: {},
		experiments: experimentDefault,
		enhancementApiConfigId: "",
		condensingApiConfigId: "", // Default empty string for condensing API config ID
		customCondensingPrompt: "", // Default empty string for custom condensing prompt
		hasOpenedModeSelector: false, // Default to false (not opened yet)
		autoApprovalEnabled: false,
		customModes: [],
		maxOpenTabsContext: 20,
		maxWorkspaceFiles: 200,
		cwd: "",
		browserToolEnabled: true,
		telemetrySetting: "enabled",
		showRooIgnoredFiles: true, // Default to showing .syntxignore'd files with lock symbol (current behavior).
		renderContext: "sidebar",
		maxReadFileLine: -1, // Default max read file line limit
		pinnedApiConfigs: {}, // Empty object for pinned API configs
		terminalZshOhMy: false, // Default Oh My Zsh integration setting
		maxConcurrentFileReads: 5, // Default concurrent file reads
		terminalZshP10k: false, // Default Powerlevel10k integration setting
		terminalZdotdir: false, // Default ZDOTDIR handling setting
		terminalCompressProgressBar: true, // Default to compress progress bar output
		historyPreviewCollapsed: false, // Initialize the new state (default to expanded)
		cloudUserInfo: null,
		cloudIsAuthenticated: false,
		sharingEnabled: false,
		// Website authentication initialization
		websiteUsername: undefined,
		syntxApiKey: undefined,
		websiteNotAuthenticated: true, // Default to not authenticated
		showAnthropicApiKeyScreen: false,
		organizationAllowList: ORGANIZATION_ALLOW_ALL,
		autoCondenseContext: true,
		autoCondenseContextPercent: 100,
		profileThresholds: {},
		codebaseIndexConfig: {
			codebaseIndexEnabled: true,
			codebaseIndexQdrantUrl: "http://localhost:6333",
			codebaseIndexEmbedderProvider: "openai",
			codebaseIndexEmbedderBaseUrl: "",
			codebaseIndexEmbedderModelId: "",
			codebaseIndexSearchMaxResults: undefined,
			codebaseIndexSearchMinScore: undefined,
		},
		codebaseIndexModels: { ollama: {}, openai: {} },
		alwaysAllowUpdateTodoList: true,
		// Multilingual features defaults
		multilingualEnabled: false,
		sarvamApiKey: "",
		multilingualTargetLanguage: "hi-IN", // Default to Hindi
	})

	const [didHydrateState, setDidHydrateState] = useState(false)
	const [showWelcome, setShowWelcome] = useState(false)
	const [theme, setTheme] = useState<any>(undefined)
	const [filePaths, setFilePaths] = useState<string[]>([])
	const [openedTabs, setOpenedTabs] = useState<Array<{ label: string; isActive: boolean; path?: string }>>([])
	const [mcpServers, setMcpServers] = useState<McpServer[]>([])
	const [currentCheckpoint, setCurrentCheckpoint] = useState<string>()
	const [extensionRouterModels, setExtensionRouterModels] = useState<RouterModels | undefined>(undefined)
	const [marketplaceItems, setMarketplaceItems] = useState<any[]>([])
	const [alwaysAllowFollowupQuestions, setAlwaysAllowFollowupQuestions] = useState(false) // Add state for follow-up questions auto-approve
	const [followupAutoApproveTimeoutMs, setFollowupAutoApproveTimeoutMs] = useState<number | undefined>(undefined) // Will be set from global settings
	const [marketplaceInstalledMetadata, setMarketplaceInstalledMetadata] = useState<MarketplaceInstalledMetadata>({
		project: {},
		global: {},
	})

	// Removed chunking refs - using data URI approach instead

	const setListApiConfigMeta = useCallback(
		(value: ProviderSettingsEntry[]) => setState((prevState) => ({ ...prevState, listApiConfigMeta: value })),
		[],
	)

	const setApiConfiguration = useCallback((value: ProviderSettings) => {
		setState((prevState) => ({
			...prevState,
			apiConfiguration: {
				...prevState.apiConfiguration,
				...value,
			},
		}))
	}, [])

	const handleMessage = useCallback(
		(event: MessageEvent) => {
			const message: ExtensionMessage = event.data

			// Debug: Log textToSpeechResult messages
			if (message.type === "textToSpeechResult") {
				console.log("🔊 ExtensionStateContext: RECEIVED textToSpeechResult message!")
				console.log("=== ExtensionStateContext: textToSpeechResult RECEIVED ===")
				console.log("Full message:", JSON.stringify(message, null, 2).substring(0, 500))
				console.log("Message type:", message.type)
				console.log("Has values:", !!message.values)
				console.log("Values keys:", message.values ? Object.keys(message.values) : [])
				console.log("Has audioChunk:", message.values?.audioChunk !== undefined)
				console.log("Has audio:", message.values?.audio !== undefined)
				console.log("Chunk index:", message.values?.chunkIndex)
				console.log("Total chunks:", message.values?.totalChunks)
				console.log("Is last chunk:", message.values?.isLastChunk)
				console.log("Chunk length:", message.values?.audioChunk?.length)
			}

			switch (message.type) {
				case "state": {
					const newState = message.state!
					console.log("ExtensionStateContext: received state", newState)
					setState((prevState) => mergeExtensionState(prevState, newState))
					setShowWelcome(!checkExistKey(newState.apiConfiguration))
					setDidHydrateState(true)
					// Update alwaysAllowFollowupQuestions if present in state message
					if ((newState as any).alwaysAllowFollowupQuestions !== undefined) {
						setAlwaysAllowFollowupQuestions((newState as any).alwaysAllowFollowupQuestions)
					}
					// Update followupAutoApproveTimeoutMs if present in state message
					if ((newState as any).followupAutoApproveTimeoutMs !== undefined) {
						setFollowupAutoApproveTimeoutMs((newState as any).followupAutoApproveTimeoutMs)
					}
					// Handle marketplace data if present in state message
					if (newState.marketplaceItems !== undefined) {
						setMarketplaceItems(newState.marketplaceItems)
					}
					if (newState.marketplaceInstalledMetadata !== undefined) {
						setMarketplaceInstalledMetadata(newState.marketplaceInstalledMetadata)
					}
					break
				}
				case "theme": {
					if (message.text) {
						setTheme(convertTextMateToHljs(JSON.parse(message.text)))
					}
					break
				}
				case "workspaceUpdated": {
					const paths = message.filePaths ?? []
					const tabs = message.openedTabs ?? []

					setFilePaths(paths)
					setOpenedTabs(tabs)
					break
				}
				case "messageUpdated": {
					const clineMessage = message.clineMessage!
					setState((prevState) => {
						// worth noting it will never be possible for a more up-to-date message to be sent here or in normal messages post since the presentAssistantContent function uses lock
						const lastIndex = findLastIndex(prevState.clineMessages, (msg) => msg.ts === clineMessage.ts)
						if (lastIndex !== -1) {
							const newClineMessages = [...prevState.clineMessages]
							newClineMessages[lastIndex] = clineMessage
							return { ...prevState, clineMessages: newClineMessages }
						}
						return prevState
					})
					break
				}
				case "requestAnthropicApiKey": {
					// Show the API key collection screen
					if (message.text) {
						const { username } = JSON.parse(message.text)
						setState((prevState) => ({
							...prevState,
							showAnthropicApiKeyScreen: true,
							websiteUsername: username,
						}))
					}
					break
				}
				case "mcpServers": {
					setMcpServers(message.mcpServers ?? [])
					break
				}
				case "currentCheckpointUpdated": {
					setCurrentCheckpoint(message.text)
					break
				}
				case "listApiConfig": {
					setListApiConfigMeta(message.listApiConfig ?? [])
					break
				}
				case "routerModels": {
					setExtensionRouterModels(message.routerModels)
					break
				}
				case "marketplaceData": {
					if (message.marketplaceItems !== undefined) {
						setMarketplaceItems(message.marketplaceItems)
					}
					if (message.marketplaceInstalledMetadata !== undefined) {
						setMarketplaceInstalledMetadata(message.marketplaceInstalledMetadata)
					}
					break
				}
				case "websiteAuth": {
					// Handle website authentication result
					if (message.text) {
						const { authenticated, username, apiKey } = JSON.parse(message.text)
						setState((prevState) => ({
							...prevState,
							websiteNotAuthenticated: !authenticated,
							websiteUsername: username,
							syntxApiKey: apiKey,
							// Hide the API key screen after successful auth
							showAnthropicApiKeyScreen: false,
						}))
					}
					break
				}
				case "textToSpeechResult": {
					console.log("🔊 ExtensionStateContext: RECEIVED textToSpeechResult message!")
					console.log("Has audioDataUri:", !!message.values?.audioDataUri)
					console.log("Has success:", !!message.values?.success)
					console.log("Has error:", !!message.values?.error)
					console.log("Temp file path:", message.values?.tempFilePath)

					// Handle audio data URI (from temp file) - legacy webview playback
					if (message.values?.audioDataUri) {
						const audioDataUri = message.values.audioDataUri as string
						const tempFilePath = message.values.tempFilePath as string

						console.log("ExtensionStateContext: Playing audio from data URI")

						try {
							// Create audio element directly from data URI
							const audio = new Audio(audioDataUri)

							// Set volume to maximum (1.0)
							audio.volume = 1.0

							// Add error handlers
							audio.addEventListener("error", (e) => {
								console.error("Audio playback error:", e)
								console.error("Audio error details:", {
									error: audio.error,
									networkState: audio.networkState,
									readyState: audio.readyState,
								})
								// Clean up temp file on error
								if (tempFilePath) {
									vscode.postMessage({
										type: "cleanupTtsAudio",
										values: { tempFilePath },
									})
								}
							})

							// Clean up temp file after playback completes
							audio.addEventListener("ended", () => {
								console.log("✅ Audio playback completed, cleaning up temp file")
								if (tempFilePath) {
									vscode.postMessage({
										type: "cleanupTtsAudio",
										values: { tempFilePath },
									})
								}
							})

							// Wait for audio to be ready before playing
							const playAudio = () => {
								console.log("Attempting to play audio, readyState:", audio.readyState)
								const playPromise = audio.play()

								if (playPromise !== undefined) {
									playPromise
										.then(() => {
											console.log("✅ Audio playback started successfully!")
										})
										.catch((error) => {
											console.error("❌ Error playing audio:", error)
											console.error("Error name:", error.name)
											console.error("Error message:", error.message)
											// Clean up on play error
											if (tempFilePath) {
												vscode.postMessage({
													type: "cleanupTtsAudio",
													values: { tempFilePath },
												})
											}
										})
								}
							}

							// Try to play immediately, or wait for canplay event
							if (audio.readyState >= 2) {
								console.log("Audio ready, playing immediately")
								playAudio()
							} else {
								console.log("Audio not ready, waiting for canplay...")
								audio.addEventListener(
									"canplaythrough",
									() => {
										console.log("canplaythrough fired")
										playAudio()
									},
									{ once: true },
								)
								audio.addEventListener(
									"loadeddata",
									() => {
										console.log("loadeddata fired")
										playAudio()
									},
									{ once: true },
								)
								setTimeout(() => {
									console.log("Timeout check, readyState:", audio.readyState)
									if (audio.readyState >= 2) {
										playAudio()
									}
								}, 100)
							}
						} catch (error) {
							console.error("Error processing audio data URI:", error)
							// Clean up on error
							if (tempFilePath) {
								vscode.postMessage({
									type: "cleanupTtsAudio",
									values: { tempFilePath },
								})
							}
						}
					} else if (message.values?.success) {
						// Backend playback success - audio is playing on the backend
						console.log("✅ Text-to-speech audio is playing on backend")
					} else if (message.values?.error) {
						console.error("Text-to-speech error:", message.values.error)
					} else {
						console.warn(
							"ExtensionStateContext: textToSpeechResult received but no audioDataUri, success, or error found",
							message,
						)
					}
					break
				}
				case "translateResult": {
					// Handle translation result - update message text
					if (message.values?.translatedText && message.values?.messageTs) {
						const messageTs = message.values.messageTs as number
						const translatedText = message.values.translatedText as string
						setState((prevState) => {
							const messageIndex = prevState.clineMessages.findIndex((msg) => msg.ts === messageTs)
							if (messageIndex !== -1) {
								const newClineMessages = [...prevState.clineMessages]
								newClineMessages[messageIndex] = {
									...newClineMessages[messageIndex],
									text: translatedText,
								}
								return { ...prevState, clineMessages: newClineMessages }
							}
							return prevState
						})
					} else if (message.values?.error) {
						console.error("Translation error:", message.values.error)
					}
					break
				}
			}
		},
		[setListApiConfigMeta],
	)

	useEffect(() => {
		window.addEventListener("message", handleMessage)
		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, [handleMessage])

	useEffect(() => {
		vscode.postMessage({ type: "webviewDidLaunch" })
	}, [])

	const contextValue: ExtensionStateContextType = {
		...state,
		didHydrateState,
		showWelcome,
		theme,
		mcpServers,
		currentCheckpoint,
		filePaths,
		openedTabs,
		soundVolume: state.soundVolume,
		ttsSpeed: state.ttsSpeed,
		fuzzyMatchThreshold: state.fuzzyMatchThreshold,
		writeDelayMs: state.writeDelayMs,
		screenshotQuality: state.screenshotQuality,
		routerModels: extensionRouterModels,
		cloudIsAuthenticated: state.cloudIsAuthenticated ?? false,
		// Website authentication properties
		websiteUsername: state.websiteUsername,
		syntxApiKey: state.syntxApiKey,
		websiteNotAuthenticated: state.websiteNotAuthenticated ?? true,
		showAnthropicApiKeyScreen: state.showAnthropicApiKeyScreen ?? false,
		marketplaceItems,
		marketplaceInstalledMetadata,
		profileThresholds: state.profileThresholds ?? {},
		alwaysAllowFollowupQuestions,
		followupAutoApproveTimeoutMs,
		setExperimentEnabled: (id, enabled) =>
			setState((prevState) => ({ ...prevState, experiments: { ...prevState.experiments, [id]: enabled } })),
		setApiConfiguration,
		setCustomInstructions: (value) => setState((prevState) => ({ ...prevState, customInstructions: value })),
		setAlwaysAllowReadOnly: (value) => setState((prevState) => ({ ...prevState, alwaysAllowReadOnly: value })),
		setAlwaysAllowReadOnlyOutsideWorkspace: (value) =>
			setState((prevState) => ({ ...prevState, alwaysAllowReadOnlyOutsideWorkspace: value })),
		setAlwaysAllowWrite: (value) => setState((prevState) => ({ ...prevState, alwaysAllowWrite: value })),
		setAlwaysAllowWriteOutsideWorkspace: (value) =>
			setState((prevState) => ({ ...prevState, alwaysAllowWriteOutsideWorkspace: value })),
		setAlwaysAllowExecute: (value) => setState((prevState) => ({ ...prevState, alwaysAllowExecute: value })),
		setAlwaysAllowBrowser: (value) => setState((prevState) => ({ ...prevState, alwaysAllowBrowser: value })),
		setAlwaysAllowMcp: (value) => setState((prevState) => ({ ...prevState, alwaysAllowMcp: value })),
		setAlwaysAllowModeSwitch: (value) => setState((prevState) => ({ ...prevState, alwaysAllowModeSwitch: value })),
		setAlwaysAllowSubtasks: (value) => setState((prevState) => ({ ...prevState, alwaysAllowSubtasks: value })),
		setAlwaysAllowFollowupQuestions,
		setFollowupAutoApproveTimeoutMs: (value) =>
			setState((prevState) => ({ ...prevState, followupAutoApproveTimeoutMs: value })),
		setShowAnnouncement: (value) => setState((prevState) => ({ ...prevState, shouldShowAnnouncement: value })),
		setAllowedCommands: (value) => setState((prevState) => ({ ...prevState, allowedCommands: value })),
		setDeniedCommands: (value) => setState((prevState) => ({ ...prevState, deniedCommands: value })),
		setAllowedMaxRequests: (value) => setState((prevState) => ({ ...prevState, allowedMaxRequests: value })),
		setSoundEnabled: (value) => setState((prevState) => ({ ...prevState, soundEnabled: value })),
		setSoundVolume: (value) => setState((prevState) => ({ ...prevState, soundVolume: value })),
		setTtsEnabled: (value) => setState((prevState) => ({ ...prevState, ttsEnabled: value })),
		setTtsSpeed: (value) => setState((prevState) => ({ ...prevState, ttsSpeed: value })),
		setDiffEnabled: (value) => setState((prevState) => ({ ...prevState, diffEnabled: value })),
		setEnableCheckpoints: (value) => setState((prevState) => ({ ...prevState, enableCheckpoints: value })),
		setBrowserViewportSize: (value: string) =>
			setState((prevState) => ({ ...prevState, browserViewportSize: value })),
		setFuzzyMatchThreshold: (value) => setState((prevState) => ({ ...prevState, fuzzyMatchThreshold: value })),
		setWriteDelayMs: (value) => setState((prevState) => ({ ...prevState, writeDelayMs: value })),
		setScreenshotQuality: (value) => setState((prevState) => ({ ...prevState, screenshotQuality: value })),
		setTerminalOutputLineLimit: (value) =>
			setState((prevState) => ({ ...prevState, terminalOutputLineLimit: value })),
		setTerminalOutputCharacterLimit: (value) =>
			setState((prevState) => ({ ...prevState, terminalOutputCharacterLimit: value })),
		setTerminalShellIntegrationTimeout: (value) =>
			setState((prevState) => ({ ...prevState, terminalShellIntegrationTimeout: value })),
		setTerminalShellIntegrationDisabled: (value) =>
			setState((prevState) => ({ ...prevState, terminalShellIntegrationDisabled: value })),
		setTerminalZdotdir: (value) => setState((prevState) => ({ ...prevState, terminalZdotdir: value })),
		setMcpEnabled: (value) => setState((prevState) => ({ ...prevState, mcpEnabled: value })),
		setEnableMcpServerCreation: (value) =>
			setState((prevState) => ({ ...prevState, enableMcpServerCreation: value })),
		setAlwaysApproveResubmit: (value) => setState((prevState) => ({ ...prevState, alwaysApproveResubmit: value })),
		setRequestDelaySeconds: (value) => setState((prevState) => ({ ...prevState, requestDelaySeconds: value })),
		setCurrentApiConfigName: (value) => setState((prevState) => ({ ...prevState, currentApiConfigName: value })),
		setListApiConfigMeta,
		setMode: (value: Mode) => setState((prevState) => ({ ...prevState, mode: value })),
		setCustomModePrompts: (value) => setState((prevState) => ({ ...prevState, customModePrompts: value })),
		setCustomSupportPrompts: (value) => setState((prevState) => ({ ...prevState, customSupportPrompts: value })),
		setEnhancementApiConfigId: (value) =>
			setState((prevState) => ({ ...prevState, enhancementApiConfigId: value })),
		setAutoApprovalEnabled: (value) => setState((prevState) => ({ ...prevState, autoApprovalEnabled: value })),
		setCustomModes: (value) => setState((prevState) => ({ ...prevState, customModes: value })),
		setMaxOpenTabsContext: (value) => setState((prevState) => ({ ...prevState, maxOpenTabsContext: value })),
		setMaxWorkspaceFiles: (value) => setState((prevState) => ({ ...prevState, maxWorkspaceFiles: value })),
		setBrowserToolEnabled: (value) => setState((prevState) => ({ ...prevState, browserToolEnabled: value })),
		setTelemetrySetting: (value) => setState((prevState) => ({ ...prevState, telemetrySetting: value })),
		setShowRooIgnoredFiles: (value) => setState((prevState) => ({ ...prevState, showRooIgnoredFiles: value })),
		setRemoteBrowserEnabled: (value) => setState((prevState) => ({ ...prevState, remoteBrowserEnabled: value })),
		setAwsUsePromptCache: (value) => setState((prevState) => ({ ...prevState, awsUsePromptCache: value })),
		setMaxReadFileLine: (value) => setState((prevState) => ({ ...prevState, maxReadFileLine: value })),
		setPinnedApiConfigs: (value) => setState((prevState) => ({ ...prevState, pinnedApiConfigs: value })),
		setTerminalCompressProgressBar: (value) =>
			setState((prevState) => ({ ...prevState, terminalCompressProgressBar: value })),
		togglePinnedApiConfig: (configId) =>
			setState((prevState) => {
				const currentPinned = prevState.pinnedApiConfigs || {}
				const newPinned = {
					...currentPinned,
					[configId]: !currentPinned[configId],
				}

				// If the config is now unpinned, remove it from the object
				if (!newPinned[configId]) {
					delete newPinned[configId]
				}

				return { ...prevState, pinnedApiConfigs: newPinned }
			}),
		setHistoryPreviewCollapsed: (value) =>
			setState((prevState) => ({ ...prevState, historyPreviewCollapsed: value })),
		setHasOpenedModeSelector: (value) => setState((prevState) => ({ ...prevState, hasOpenedModeSelector: value })),
		setAutoCondenseContext: (value) => setState((prevState) => ({ ...prevState, autoCondenseContext: value })),
		setAutoCondenseContextPercent: (value) =>
			setState((prevState) => ({ ...prevState, autoCondenseContextPercent: value })),
		setCondensingApiConfigId: (value) => setState((prevState) => ({ ...prevState, condensingApiConfigId: value })),
		setCustomCondensingPrompt: (value) =>
			setState((prevState) => ({ ...prevState, customCondensingPrompt: value })),
		setProfileThresholds: (value) => setState((prevState) => ({ ...prevState, profileThresholds: value })),
		alwaysAllowUpdateTodoList: state.alwaysAllowUpdateTodoList,
		setAlwaysAllowUpdateTodoList: (value) => {
			setState((prevState) => ({ ...prevState, alwaysAllowUpdateTodoList: value }))
		},
		// Multilingual features
		multilingualEnabled: state.multilingualEnabled ?? false,
		setMultilingualEnabled: (value) => setState((prevState) => ({ ...prevState, multilingualEnabled: value })),
		sarvamApiKey: state.sarvamApiKey ?? "",
		setSarvamApiKey: (value) => setState((prevState) => ({ ...prevState, sarvamApiKey: value })),
		multilingualTargetLanguage: state.multilingualTargetLanguage ?? "hi-IN",
		setMultilingualTargetLanguage: (value) =>
			setState((prevState) => ({ ...prevState, multilingualTargetLanguage: value })),
	}

	return <ExtensionStateContext.Provider value={contextValue}>{children}</ExtensionStateContext.Provider>
}

export const useExtensionState = () => {
	const context = useContext(ExtensionStateContext)

	if (context === undefined) {
		throw new Error("useExtensionState must be used within an ExtensionStateContextProvider")
	}

	return context
}
