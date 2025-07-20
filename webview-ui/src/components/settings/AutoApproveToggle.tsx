import type { GlobalSettings } from "@roo-code/types"
import { useCallback, useEffect, useState } from "react"

import { useAppTranslation } from "@/i18n/TranslationContext"
import { cn } from "@/lib/utils"
import { Button, StandardTooltip } from "@/components/ui"

type AutoApproveToggles = Pick<
	GlobalSettings,
	| "alwaysAllowReadOnly"
	| "alwaysAllowWrite"
	| "alwaysAllowBrowser"
	| "alwaysApproveResubmit"
	| "alwaysAllowMcp"
	| "alwaysAllowModeSwitch"
	| "alwaysAllowSubtasks"
	| "alwaysAllowExecute"
	| "alwaysAllowFollowupQuestions"
	| "alwaysAllowUpdateTodoList"
>

export type AutoApproveSetting = keyof AutoApproveToggles

type AutoApproveConfig = {
	key: AutoApproveSetting
	labelKey: string
	descriptionKey: string
	icon: string
	testId: string
}

export const autoApproveSettingsConfig: Record<AutoApproveSetting, AutoApproveConfig> = {
	alwaysAllowReadOnly: {
		key: "alwaysAllowReadOnly",
		labelKey: "settings:autoApprove.readOnly.label",
		descriptionKey: "settings:autoApprove.readOnly.description",
		icon: "eye",
		testId: "always-allow-readonly-toggle",
	},
	alwaysAllowWrite: {
		key: "alwaysAllowWrite",
		labelKey: "settings:autoApprove.write.label",
		descriptionKey: "settings:autoApprove.write.description",
		icon: "edit",
		testId: "always-allow-write-toggle",
	},
	alwaysAllowBrowser: {
		key: "alwaysAllowBrowser",
		labelKey: "settings:autoApprove.browser.label",
		descriptionKey: "settings:autoApprove.browser.description",
		icon: "globe",
		testId: "always-allow-browser-toggle",
	},
	alwaysApproveResubmit: {
		key: "alwaysApproveResubmit",
		labelKey: "settings:autoApprove.retry.label",
		descriptionKey: "settings:autoApprove.retry.description",
		icon: "refresh",
		testId: "always-approve-resubmit-toggle",
	},
	alwaysAllowMcp: {
		key: "alwaysAllowMcp",
		labelKey: "settings:autoApprove.mcp.label",
		descriptionKey: "settings:autoApprove.mcp.description",
		icon: "plug",
		testId: "always-allow-mcp-toggle",
	},
	alwaysAllowModeSwitch: {
		key: "alwaysAllowModeSwitch",
		labelKey: "settings:autoApprove.modeSwitch.label",
		descriptionKey: "settings:autoApprove.modeSwitch.description",
		icon: "sync",
		testId: "always-allow-mode-switch-toggle",
	},
	alwaysAllowSubtasks: {
		key: "alwaysAllowSubtasks",
		labelKey: "settings:autoApprove.subtasks.label",
		descriptionKey: "settings:autoApprove.subtasks.description",
		icon: "list-tree",
		testId: "always-allow-subtasks-toggle",
	},
	alwaysAllowExecute: {
		key: "alwaysAllowExecute",
		labelKey: "settings:autoApprove.execute.label",
		descriptionKey: "settings:autoApprove.execute.description",
		icon: "terminal",
		testId: "always-allow-execute-toggle",
	},
	alwaysAllowFollowupQuestions: {
		key: "alwaysAllowFollowupQuestions",
		labelKey: "settings:autoApprove.followupQuestions.label",
		descriptionKey: "settings:autoApprove.followupQuestions.description",
		icon: "question",
		testId: "always-allow-followup-questions-toggle",
	},
	alwaysAllowUpdateTodoList: {
		key: "alwaysAllowUpdateTodoList",
		labelKey: "settings:autoApprove.updateTodoList.label",
		descriptionKey: "settings:autoApprove.updateTodoList.description",
		icon: "checklist",
		testId: "always-allow-update-todo-list-toggle",
	},
}

type AutoApproveToggleProps = AutoApproveToggles & {
	autoApprovalEnabled?: boolean
	onToggle: (key: AutoApproveSetting, value: boolean) => void
	onAutoApprovalToggle?: (enabled: boolean) => void
}

export const AutoApproveToggle = ({
	onToggle,
	autoApprovalEnabled,
	onAutoApprovalToggle,
	...props
}: AutoApproveToggleProps) => {
	const { t } = useAppTranslation()
	const [hasUserManuallyDisabledAutoApproval, setHasUserManuallyDisabledAutoApproval] = useState(false)

	// Track if user has manually disabled auto-approval
	useEffect(() => {
		if (autoApprovalEnabled === false) {
			setHasUserManuallyDisabledAutoApproval(true)
		}
	}, [autoApprovalEnabled])

	const handleToggle = useCallback(
		(key: AutoApproveSetting, value: boolean) => {
			// If auto-approval is off and user is trying to enable an individual setting
			if (!autoApprovalEnabled && value && !hasUserManuallyDisabledAutoApproval) {
				// Auto-enable auto-approval when user clicks on an individual setting for the first time
				onAutoApprovalToggle?.(true)
			}

			onToggle(key, value)
		},
		[autoApprovalEnabled, hasUserManuallyDisabledAutoApproval, onAutoApprovalToggle, onToggle],
	)

	// Check if any individual settings are enabled but auto-approval is off
	const hasIndividualSettingsEnabled = Object.values(autoApproveSettingsConfig).some(({ key }) => props[key])

	return (
		<div className="space-y-4">
			{/* Warning message when auto-approval is off but individual settings are enabled */}
			{!autoApprovalEnabled && hasIndividualSettingsEnabled && (
				<div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
					<span className="codicon codicon-warning text-yellow-500" />
					<span className="text-sm text-yellow-600 dark:text-yellow-400">
						{t("settings:autoApprove.warning.disabled")}
					</span>
				</div>
			)}

			<div
				className={cn(
					"flex flex-row flex-wrap justify-center gap-2 max-w-[600px] mx-auto my-2 ",
					"[@media(min-width:600px)]:gap-4",
					"[@media(min-width:800px)]:max-w-[900px]",
					"[@media(min-width:1200px)]:max-w-[1800px]",
				)}>
				{Object.values(autoApproveSettingsConfig).map(({ key, descriptionKey, labelKey, icon, testId }) => (
					<StandardTooltip key={key} content={t(descriptionKey || "")}>
						<Button
							variant={props[key] ? "default" : "outline"}
							onClick={() => handleToggle(key, !props[key])}
							aria-label={t(labelKey)}
							aria-pressed={!!props[key]}
							data-testid={testId}
							className={cn(" aspect-square h-[80px]", !props[key] && "opacity-50")}>
							<span className={cn("flex flex-col items-center gap-1")}>
								<span className={`codicon codicon-${icon}`} />
								<span className="text-sm text-center">{t(labelKey)}</span>
							</span>
						</Button>
					</StandardTooltip>
				))}
			</div>
		</div>
	)
}
