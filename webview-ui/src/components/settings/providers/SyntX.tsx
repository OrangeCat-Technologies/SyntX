import { useCallback, useState, useMemo, useEffect } from "react"
import { VSCodeTextField, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"

import { type ProviderSettings } from "@roo-code/types"

import type { RouterModels } from "@roo/api"

import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { VSCodeButtonLink } from "@src/components/common/VSCodeButtonLink"
import { Button } from "@src/components/ui"

import { inputEventTransform } from "../transforms"

type SyntXProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
	routerModels?: RouterModels
	refetchRouterModels: () => void
	_modelValidationError?: string
	_organizationAllowList?: any
}

export const SyntX = ({
	apiConfiguration,
	setApiConfigurationField,
	routerModels,
	refetchRouterModels,
	_modelValidationError,
	_organizationAllowList,
}: SyntXProps) => {
	const { t } = useAppTranslation()

	const [didRefetch, setDidRefetch] = useState<boolean>()

	const handleInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	// Default preferred models for auto-selection
	const defaultPreferredModels = useMemo(
		() => ["deepseek-v3", "claude-sonnet-4-20250514", "perplexity-sonar", "gemini-2.5-pro"],
		[],
	)

	const syntxModels = Object.keys(routerModels?.syntx ?? {})

	// Initialize selectedSyntxModels with defaults if empty
	const initializeSelectedModels = useCallback(() => {
		if (!apiConfiguration?.selectedSyntxModels || apiConfiguration.selectedSyntxModels.length === 0) {
			const availableDefaults = syntxModels.filter((model) => defaultPreferredModels.includes(model))
			const modelsToSelect = availableDefaults.length > 0 ? availableDefaults : syntxModels.slice(0, 4)
			setApiConfigurationField("selectedSyntxModels", modelsToSelect)
		}
	}, [syntxModels, apiConfiguration?.selectedSyntxModels, defaultPreferredModels, setApiConfigurationField])

	// Initialize selected models when component mounts or syntx models change
	useEffect(() => {
		if (syntxModels.length > 0) {
			initializeSelectedModels()
		}
	}, [syntxModels.length, initializeSelectedModels])

	return (
		<>
			{/* API Key Field */}
			<VSCodeTextField
				value={apiConfiguration?.syntxApiKey || ""}
				type="password"
				onInput={handleInputChange("syntxApiKey")}
				placeholder={t("settings:placeholders.apiKey")}
				className="w-full">
				<label className="block font-medium mb-1">SyntX API Key</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.apiKeyStorageNotice")}
			</div>

			{/* Get API Key Link */}
			{!apiConfiguration?.syntxApiKey && (
				<VSCodeButtonLink href="https://syntx.dev" style={{ width: "100%" }} appearance="primary">
					Get SyntX API Key
				</VSCodeButtonLink>
			)}

			{/* Base URL Field */}
			<VSCodeTextField
				value={apiConfiguration?.syntxBaseUrl || ""}
				onInput={handleInputChange("syntxBaseUrl")}
				placeholder="https://lagrange-inference-server-production.up.railway.app"
				className="w-full">
				<label className="block font-medium mb-1">Base URL (Optional)</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				Leave empty to use the default SyntX endpoint
			</div>

			{/* Refresh Models Button */}
			<Button
				variant="outline"
				onClick={() => {
					vscode.postMessage({ type: "flushRouterModels", text: "syntx" })
					refetchRouterModels()
					setDidRefetch(true)
				}}>
				<div className="flex items-center gap-2">
					<span className="codicon codicon-refresh" />
					{t("settings:providers.refreshModels.label")}
				</div>
			</Button>
			{didRefetch && (
				<div className="flex items-center text-vscode-errorForeground">
					{t("settings:providers.refreshModels.hint")}
				</div>
			)}

			{/* Selected Models Management */}
			<div>
				<label className="block font-medium mb-1">Available Models</label>
				<div className="text-sm text-vscode-descriptionForeground mb-2">
					Choose which models to show in the chat dropdown. Model selection and auto-mode can be changed
					directly in the chat interface.
				</div>
				<div className="space-y-1 max-h-96 overflow-y-auto border border-vscode-input-border rounded p-2">
					{syntxModels.map((model) => {
						const isDefaultModel = defaultPreferredModels.includes(model)
						const isSelected =
							apiConfiguration?.selectedSyntxModels?.includes(model) ??
							((!apiConfiguration?.selectedSyntxModels ||
								apiConfiguration.selectedSyntxModels.length === 0) &&
								isDefaultModel)

						return (
							<div key={model} className="flex items-center gap-2">
								<VSCodeCheckbox
									checked={isSelected}
									onChange={(e: any) => {
										const isChecked = e.target.checked
										const currentSelected = apiConfiguration?.selectedSyntxModels || []

										if (isChecked) {
											// Add model to selection
											setApiConfigurationField("selectedSyntxModels", [...currentSelected, model])
										} else {
											// Remove model from selection
											setApiConfigurationField(
												"selectedSyntxModels",
												currentSelected.filter((m) => m !== model),
											)
										}
									}}
								/>
								<label className="text-xs">{model}</label>
							</div>
						)
					})}
				</div>
			</div>
		</>
	)
}
