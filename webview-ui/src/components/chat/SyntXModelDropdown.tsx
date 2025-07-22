import React, { useMemo, useCallback, useEffect, useState, useRef } from "react"
import { ChevronDown, Check, Plus } from "lucide-react"

import type { ProviderSettings } from "@roo-code/types"
import type { RouterModels } from "@roo/api"

import { vscode } from "@/utils/vscode"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger, ToggleSwitch } from "@/components/ui"
import { useRooPortal } from "@/components/ui/hooks/useRooPortal"
import { useExtensionState } from "@/context/ExtensionStateContext"

interface SyntXModelDropdownProps {
	apiConfiguration: ProviderSettings
	routerModels?: RouterModels
	sendingDisabled: boolean
	currentApiConfigName?: string
}

const SyntXModelDropdown: React.FC<SyntXModelDropdownProps> = ({
	apiConfiguration,
	routerModels,
	sendingDisabled,
	currentApiConfigName,
}) => {
	const [selectedSyntxModel, setSelectedSyntxModel] = useState<string>("")
	const [isAutoSelectEnabled, setIsAutoSelectEnabled] = useState<boolean>(false)
	const [open, setOpen] = useState(false)
	const portalContainer = useRooPortal("roo-portal")

	// Get auto-approval setters from extension state
	const {
		setAutoApprovalEnabled,
		setAlwaysAllowReadOnly,
		setAlwaysAllowWrite,
		setAlwaysAllowExecute,
		setAlwaysAllowModeSwitch,
		setAlwaysAllowUpdateTodoList,
		setAlwaysAllowFollowupQuestions,
		setAlwaysAllowSubtasks,
	} = useExtensionState()

	// Track if we've made a local update to prevent props from overriding
	const localUpdateRef = useRef(false)

	// Default preferred models for auto-selection
	const defaultPreferredModels = useMemo(
		() => ["deepseek-v3", "claude-sonnet-4-20250514", "perplexity-sonar", "gemini-2.5-pro"],
		[],
	)

	const syntxModels = Object.keys(routerModels?.syntx ?? {})

	// Filter models based on user selection or use defaults
	const filteredSyntxModels = useMemo(() => {
		if (apiConfiguration?.selectedSyntxModels && apiConfiguration.selectedSyntxModels.length > 0) {
			return syntxModels.filter((model) => apiConfiguration.selectedSyntxModels?.includes(model))
		}

		const availableDefaults = syntxModels.filter((model) => defaultPreferredModels.includes(model))

		return availableDefaults.length > 0 ? availableDefaults : syntxModels
	}, [syntxModels, apiConfiguration?.selectedSyntxModels, defaultPreferredModels])

	// Update local state when API configuration changes, but not if we just made a local update
	useEffect(() => {
		// Don't sync from props if we just made a local update
		if (localUpdateRef.current) {
			localUpdateRef.current = false
			return
		}

		// Sync both model selection and auto-select state
		if (apiConfiguration?.syntxModelId) {
			setSelectedSyntxModel(apiConfiguration.syntxModelId)
		} else if (!apiConfiguration?.syntxAutoSelectEnabled && filteredSyntxModels.includes("deepseek-v3")) {
			setSelectedSyntxModel("deepseek-v3")
		}

		setIsAutoSelectEnabled(!!apiConfiguration?.syntxAutoSelectEnabled)
	}, [apiConfiguration?.syntxModelId, apiConfiguration?.syntxAutoSelectEnabled, filteredSyntxModels])

	// Request SyntX models on mount
	useEffect(() => {
		vscode.postMessage({
			type: "requestRouterModels",
			text: "syntx",
		})
	}, [])

	const handleModelSelection = useCallback(
		(modelId: string) => {
			// Mark that we're making a local update
			localUpdateRef.current = true

			// Update local state immediately
			setSelectedSyntxModel(modelId)
			setIsAutoSelectEnabled(false)
			setOpen(false)

			// Send message to backend
			const message = {
				type: "saveApiConfiguration" as const,
				text: currentApiConfigName || "default",
				apiConfiguration: {
					...apiConfiguration,
					apiProvider: "syntx" as const,
					syntxModelId: modelId,
					syntxAutoSelectEnabled: false,
				},
			}
			console.log("SyntXModelDropdown: sending saveApiConfiguration", message)
			vscode.postMessage(message)
		},
		[currentApiConfigName, apiConfiguration],
	)

	const handleAutoSelectToggle = useCallback(() => {
		const newAutoSelectEnabled = !isAutoSelectEnabled

		// Mark that we're making a local update
		localUpdateRef.current = true

		// Update local state immediately
		setIsAutoSelectEnabled(newAutoSelectEnabled)

		if (newAutoSelectEnabled) {
			// Enable auto-select and auto-approval settings
			const message = {
				type: "saveApiConfiguration" as const,
				text: currentApiConfigName || "default",
				apiConfiguration: {
					...apiConfiguration,
					apiProvider: "syntx" as const,
					syntxAutoSelectEnabled: true,
				},
			}
			console.log("SyntXModelDropdown: sending saveApiConfiguration for auto-select ON", message)
			vscode.postMessage(message)

			// Enable auto-approval settings when SyntX auto-select is enabled
			setAutoApprovalEnabled(true)
			setAlwaysAllowReadOnly(true)
			setAlwaysAllowWrite(true)
			setAlwaysAllowExecute(true)
			setAlwaysAllowModeSwitch(true)
			setAlwaysAllowUpdateTodoList(true)
			setAlwaysAllowFollowupQuestions(true)
			setAlwaysAllowSubtasks(true)

			// Send auto-approval settings to backend
			vscode.postMessage({ type: "autoApprovalEnabled", bool: true })
			vscode.postMessage({ type: "alwaysAllowReadOnly", bool: true })
			vscode.postMessage({ type: "alwaysAllowWrite", bool: true })
			vscode.postMessage({ type: "alwaysAllowExecute", bool: true })
			vscode.postMessage({ type: "alwaysAllowModeSwitch", bool: true })
			vscode.postMessage({ type: "alwaysAllowUpdateTodoList", bool: true })
			vscode.postMessage({ type: "alwaysAllowFollowupQuestions", bool: true })
			vscode.postMessage({ type: "alwaysAllowSubtasks", bool: true })
		} else {
			// Disable auto-select and select specific model
			const modelToSelect =
				selectedSyntxModel ||
				(filteredSyntxModels.includes("deepseek-v3") ? "deepseek-v3" : filteredSyntxModels[0])

			setSelectedSyntxModel(modelToSelect)
			const message = {
				type: "saveApiConfiguration" as const,
				text: currentApiConfigName || "default",
				apiConfiguration: {
					...apiConfiguration,
					apiProvider: "syntx" as const,
					syntxModelId: modelToSelect,
					syntxAutoSelectEnabled: false,
				},
			}
			console.log("SyntXModelDropdown: sending saveApiConfiguration for auto-select OFF", message)
			vscode.postMessage(message)

			// Disable auto-approval settings when SyntX auto-select is disabled
			setAutoApprovalEnabled(false)
			setAlwaysAllowReadOnly(false)
			setAlwaysAllowWrite(false)
			setAlwaysAllowExecute(false)
			setAlwaysAllowModeSwitch(false)
			setAlwaysAllowUpdateTodoList(false)
			setAlwaysAllowFollowupQuestions(false)
			setAlwaysAllowSubtasks(false)

			// Send auto-approval settings to backend
			vscode.postMessage({ type: "autoApprovalEnabled", bool: false })
			vscode.postMessage({ type: "alwaysAllowReadOnly", bool: false })
			vscode.postMessage({ type: "alwaysAllowWrite", bool: false })
			vscode.postMessage({ type: "alwaysAllowExecute", bool: false })
			vscode.postMessage({ type: "alwaysAllowModeSwitch", bool: false })
			vscode.postMessage({ type: "alwaysAllowUpdateTodoList", bool: false })
			vscode.postMessage({ type: "alwaysAllowFollowupQuestions", bool: false })
			vscode.postMessage({ type: "alwaysAllowSubtasks", bool: false })
		}
	}, [
		isAutoSelectEnabled,
		apiConfiguration,
		currentApiConfigName,
		selectedSyntxModel,
		filteredSyntxModels,
		setAutoApprovalEnabled,
		setAlwaysAllowReadOnly,
		setAlwaysAllowWrite,
		setAlwaysAllowExecute,
		setAlwaysAllowModeSwitch,
		setAlwaysAllowUpdateTodoList,
		setAlwaysAllowFollowupQuestions,
		setAlwaysAllowSubtasks,
	])

	const handleAddModels = useCallback(() => {
		setOpen(false)
		window.postMessage(
			{
				type: "action",
				action: "settingsButtonClicked",
				values: { section: "providers" },
			},
			"*",
		)
	}, [])

	const displayText = useMemo(() => {
		if (isAutoSelectEnabled) {
			return "Auto"
		}
		return selectedSyntxModel || "deepseek-v3"
	}, [isAutoSelectEnabled, selectedSyntxModel])

	return (
		<div className="flex-1 min-w-0 overflow-hidden">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					disabled={sendingDisabled}
					className={cn(
						"inline-flex items-center gap-1.5 relative whitespace-nowrap px-1.5 py-1 text-xs",
						"bg-transparent border border-[rgba(255,255,255,0.08)] rounded-md text-vscode-foreground",
						"transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-vscode-focusBorder focus-visible:ring-inset",
						sendingDisabled
							? "opacity-50 cursor-not-allowed"
							: "opacity-90 hover:opacity-100 hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)] cursor-pointer",
						"w-full justify-between",
					)}
					title="Select SyntX Model">
					<span className="truncate" title={displayText}>
						{displayText}
					</span>
					<ChevronDown className="pointer-events-none opacity-80 flex-shrink-0 size-3" />
				</PopoverTrigger>

				<PopoverContent
					align="start"
					sideOffset={4}
					container={portalContainer}
					className="p-0 overflow-hidden min-w-[200px] max-w-[350px]">
					<div className="flex flex-col w-full">
						{/* Auto-Select Toggle */}
						<div className="p-3 border-b border-vscode-dropdown-border">
							<div className="flex items-center justify-between gap-3">
								<div className="flex-grow">
									<div className="font-medium text-sm mb-1">Auto-Select Model</div>
									<div className="text-xs text-vscode-descriptionForeground">
										Automatically choose the best model for your task
									</div>
								</div>
								<ToggleSwitch
									checked={isAutoSelectEnabled}
									onChange={handleAutoSelectToggle}
									disabled={sendingDisabled}
									aria-label="Toggle auto-select model"
									data-testid="syntx-auto-select-toggle"
								/>
							</div>
						</div>

						{/* Model List - Only show when auto-select is disabled */}
						{!isAutoSelectEnabled && filteredSyntxModels.length > 0 && (
							<div className="max-h-[300px] overflow-y-auto py-0">
								{filteredSyntxModels.map((model) => (
									<div
										key={model}
										className={cn(
											"p-2 text-sm cursor-pointer flex flex-row gap-4 items-center",
											"hover:bg-vscode-list-hoverBackground",
											model === selectedSyntxModel
												? "bg-vscode-list-activeSelectionBackground text-vscode-list-activeSelectionForeground"
												: "",
										)}
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											handleModelSelection(model)
										}}>
										<div className="flex-grow">
											<p className="m-0 mb-0 font-bold">{model}</p>
										</div>
										{model === selectedSyntxModel ? (
											<Check className="m-0 size-4 p-0.5" />
										) : (
											<div className="size-4" />
										)}
									</div>
								))}
							</div>
						)}

						{/* Add Models Button */}
						<div className="border-t border-vscode-dropdown-border">
							<div
								className="p-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-vscode-list-hoverBackground"
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									handleAddModels()
								}}>
								<Plus className="size-4" />
								<span>Add Models</span>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}

export default SyntXModelDropdown
