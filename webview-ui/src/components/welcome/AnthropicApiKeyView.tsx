import React, { useState, useMemo, useCallback } from "react"
import { vscode } from "../../utils/vscode"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { SearchableSelect, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@src/components/ui"
import { PROVIDERS, MODELS_BY_PROVIDER } from "@src/components/settings/constants"
import { filterProviders, filterModels } from "@src/components/settings/utils/organizationFilters"
import { useExtensionState } from "@src/context/ExtensionStateContext"
import { useSelectedModel } from "@src/components/ui/hooks/useSelectedModel"
import { useRouterModels } from "@src/components/ui/hooks/useRouterModels"
import type { ProviderName, ProviderSettings } from "@roo-code/types"
import {
	Anthropic,
	ClaudeCode,
	DeepSeek,
	Gemini,
	Groq,
	OpenAI,
	OpenRouter,
	XAI,
	Ollama,
	LMStudio,
	Bedrock,
	Vertex,
	OpenAICompatible,
} from "@src/components/settings/providers"

interface AnthropicApiKeyViewProps {
	username?: string
	onComplete: () => void
}

// Only include providers that require API keys for initial setup
const API_KEY_PROVIDERS = [
	"anthropic",
	"claude-code",
	"openai-native",
	"openrouter",
	"gemini",
	"deepseek",
	"xai",
	"groq",
	"ollama",
	"lmstudio",
	"bedrock",
	"vertex",
	"openai",
	"openai-compatible",
] as const

const AnthropicApiKeyView = ({ username, onComplete }: AnthropicApiKeyViewProps) => {
	const { organizationAllowList, uriScheme } = useExtensionState()
	const [apiConfiguration, setApiConfiguration] = useState<ProviderSettings>({
		apiProvider: "openrouter",
	})
	const [loading, setLoading] = useState(false)

	const selectedProvider = apiConfiguration.apiProvider || "openrouter"
	const { data: routerModels } = useRouterModels()

	const setApiConfigurationField = useCallback(
		<K extends keyof ProviderSettings>(field: K, value: ProviderSettings[K]) => {
			setApiConfiguration((prev) => ({
				...prev,
				[field]: value,
			}))
		},
		[],
	)

	const { provider: _provider, id: selectedModelId } = useSelectedModel(apiConfiguration)

	// Filter providers to only show those that require API keys
	const providerOptions = useMemo(() => {
		const apiKeyProviders = PROVIDERS.filter((p) => API_KEY_PROVIDERS.includes(p.value as any))
		return filterProviders(apiKeyProviders, organizationAllowList).map(({ value, label }) => ({
			value,
			label,
		}))
	}, [organizationAllowList])

	// Get available models for the selected provider
	const selectedProviderModels = useMemo(() => {
		const models = MODELS_BY_PROVIDER[selectedProvider]
		if (!models) return []

		const filteredModels = filterModels(models, selectedProvider, organizationAllowList)
		if (!filteredModels) return []

		return Object.entries(filteredModels).map(([id, model]) => ({
			value: id,
			label: (model as any).name || id,
		}))
	}, [selectedProvider, organizationAllowList])

	const handleSubmit = async () => {
		setLoading(true)
		try {
			// Send the complete API configuration to the extension
			vscode.postMessage({
				type: "anthropicApiKeySubmitted",
				payload: {
					apiConfiguration,
					username,
				},
			})
			onComplete()
		} catch (_err) {
			setLoading(false)
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100vh",
				backgroundColor: "var(--vscode-editor-background)",
				color: "var(--vscode-editor-foreground)",
			}}>
			{/* Scrollable content area */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "40px",
					maxWidth: "600px",
					margin: "0 auto",
					width: "100%",
				}}>
				<h2 style={{ marginTop: 0 }}>Welcome{username ? `, ${username}` : ""}!</h2>
				<h3>Choose Your AI Provider</h3>
				<p>Select your preferred AI provider and configure your credentials to get started with SyntX.</p>

				<div style={{ marginBottom: "24px", marginTop: "20px" }}>
					<label
						style={{
							display: "block",
							fontWeight: "500",
							marginBottom: "8px",
							fontSize: "14px",
						}}>
						Provider
					</label>
					<SearchableSelect
						value={selectedProvider}
						onValueChange={(value) => {
							setApiConfigurationField("apiProvider", value as ProviderName)
						}}
						options={providerOptions}
						placeholder="Select a provider"
						searchPlaceholder="Search providers..."
						emptyMessage="No providers found"
						className="w-full"
					/>
				</div>

				{/* Provider-specific configuration */}
				<div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
					{selectedProvider === "anthropic" && (
						<Anthropic
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
						/>
					)}

					{selectedProvider === "claude-code" && (
						<ClaudeCode
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
						/>
					)}

					{selectedProvider === "openai-native" && (
						<OpenAI
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
						/>
					)}

					{selectedProvider === "openrouter" && (
						<OpenRouter
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
							routerModels={routerModels}
							selectedModelId={selectedModelId}
							uriScheme={uriScheme}
							fromWelcomeView={true}
							organizationAllowList={organizationAllowList}
							modelValidationError={undefined}
						/>
					)}

					{selectedProvider === "gemini" && (
						<Gemini
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
						/>
					)}

					{selectedProvider === "deepseek" && (
						<DeepSeek
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
						/>
					)}

					{selectedProvider === "xai" && (
						<XAI apiConfiguration={apiConfiguration} setApiConfigurationField={setApiConfigurationField} />
					)}

					{selectedProvider === "groq" && (
						<Groq apiConfiguration={apiConfiguration} setApiConfigurationField={setApiConfigurationField} />
					)}

					{selectedProvider === "ollama" && (
						<Ollama
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
						/>
					)}

					{selectedProvider === "lmstudio" && (
						<LMStudio
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
						/>
					)}

					{selectedProvider === "bedrock" && (
						<Bedrock
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
						/>
					)}

					{selectedProvider === "vertex" && (
						<Vertex
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
						/>
					)}

					{selectedProvider === "openai" && (
						<OpenAICompatible
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
							organizationAllowList={organizationAllowList}
						/>
					)}
				</div>

				{/* Model selection dropdown for providers with predefined models */}
				{selectedProviderModels.length > 0 && (
					<div style={{ marginTop: "12px" }}>
						<label
							style={{
								display: "block",
								fontWeight: "500",
								marginBottom: "8px",
								fontSize: "14px",
							}}>
							Model
						</label>
						<Select
							value={selectedModelId || ""}
							onValueChange={(value) => {
								setApiConfigurationField("apiModelId", value)
							}}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a model" />
							</SelectTrigger>
							<SelectContent>
								{selectedProviderModels.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Button in content flow */}
				<VSCodeButton onClick={handleSubmit} disabled={loading} style={{ width: "100%", marginTop: "16px" }}>
					{loading ? "Saving..." : "Continue"}
				</VSCodeButton>
			</div>
		</div>
	)
}

export default AnthropicApiKeyView
