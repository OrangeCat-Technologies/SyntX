import { HTMLAttributes, useEffect } from "react"
import { Languages } from "lucide-react"
import i18next from "i18next"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { cn } from "@src/lib/utils"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui"

import { SetCachedStateField } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { ApiErrorMessage } from "./ApiErrorMessage"

// Sarvam AI supported languages
const SARVAM_LANGUAGES: Record<string, string> = {
	"bn-IN": "Bengali",
	"en-IN": "English",
	"gu-IN": "Gujarati",
	"hi-IN": "Hindi",
	"kn-IN": "Kannada",
	"ml-IN": "Malayalam",
	"mr-IN": "Marathi",
	"od-IN": "Odia",
	"pa-IN": "Punjabi",
	"ta-IN": "Tamil",
	"te-IN": "Telugu",
}

type MultilingualSettingsProps = HTMLAttributes<HTMLDivElement> & {
	multilingualEnabled: boolean
	sarvamApiKey: string
	multilingualTargetLanguage: string
	setCachedStateField: SetCachedStateField<"multilingualEnabled" | "sarvamApiKey" | "multilingualTargetLanguage">
	errorMessage?: string | undefined
	setErrorMessage?: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const MultilingualSettings = ({
	multilingualEnabled,
	sarvamApiKey,
	multilingualTargetLanguage,
	setCachedStateField,
	errorMessage,
	setErrorMessage,
	className,
	...props
}: MultilingualSettingsProps) => {
	const { t } = useAppTranslation()

	// Validate multilingual settings: if enabled, API key must be provided
	useEffect(() => {
		if (setErrorMessage) {
			if (multilingualEnabled && !sarvamApiKey?.trim()) {
				setErrorMessage(i18next.t("settings:validation.apiKey"))
			} else {
				// Clear error if validation passes
				setErrorMessage(undefined)
			}
		}
	}, [multilingualEnabled, sarvamApiKey, setErrorMessage])

	return (
		<div className={cn("flex flex-col gap-2", className)} {...props}>
			<SectionHeader>
				<div className="flex items-center gap-2">
					<Languages className="w-4" />
					<div>{t("settings:sections.multilingual")}</div>
				</div>
			</SectionHeader>

			<Section>
				<div className="flex flex-col gap-4">
					{/* Description */}
					<p className="text-sm text-muted-foreground">{t("settings:multilingual.description")}</p>

					{/* Enable Multilingual Features Toggle */}
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="multilingual-enabled"
							checked={multilingualEnabled}
							onChange={(e) => setCachedStateField("multilingualEnabled", e.target.checked)}
							className="h-4 w-4 rounded border-gray-300"
						/>
						<label htmlFor="multilingual-enabled" className="text-sm font-medium">
							{t("settings:multilingual.enableLabel")}
						</label>
					</div>

					{/* Sarvam API Key Input - only shown when enabled */}
					{multilingualEnabled && (
						<>
							{/* Error message - only show when multilingual is enabled */}
							{errorMessage && <ApiErrorMessage errorMessage={errorMessage} />}
							<div className="flex flex-col gap-1">
								<label className="text-sm font-medium">{t("settings:multilingual.apiKeyLabel")}</label>
								<input
									type="password"
									value={sarvamApiKey}
									onChange={(e) => setCachedStateField("sarvamApiKey", e.target.value)}
									placeholder={t("settings:multilingual.apiKeyPlaceholder")}
									className="w-full px-3 py-2 text-sm border rounded-md bg-vscode-input-background text-vscode-input-foreground border-vscode-input-border focus:outline-none focus:ring-1 focus:ring-vscode-focusBorder"
								/>
								<p className="text-xs text-muted-foreground">
									{t("settings:providers.apiKeyStorageNotice")}
								</p>
							</div>

							{/* Target Language Dropdown */}
							<div className="flex flex-col gap-1">
								<label className="text-sm font-medium">
									{t("settings:multilingual.languageLabel")}
								</label>
								<Select
									value={multilingualTargetLanguage}
									onValueChange={(value) => setCachedStateField("multilingualTargetLanguage", value)}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={t("settings:common.select")} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{Object.entries(SARVAM_LANGUAGES).map(([code, name]) => (
												<SelectItem key={code} value={code}>
													{name}
													<span className="text-muted-foreground ml-1">({code})</span>
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">
									{t("settings:multilingual.languageDescription")}
								</p>
							</div>
						</>
					)}
				</div>
			</Section>
		</div>
	)
}
