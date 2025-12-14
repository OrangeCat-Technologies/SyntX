import React, { useCallback, useRef, useState } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { StandardTooltip } from "@/components/ui"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { vscode } from "@/utils/vscode"
import { useEvent } from "react-use"

interface VoiceRecorderProps {
	onTranscription: (text: string) => void
	disabled?: boolean
	language?: string
}

type RecordingState = "idle" | "starting" | "recording" | "processing"

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription, disabled = false, language = "en" }) => {
	const { t } = useAppTranslation()
	const [recordingState, setRecordingState] = useState<RecordingState>("idle")
	const [error, setError] = useState<string | null>(null)
	const isProcessingRef = useRef(false)

	// Handle messages from extension host
	const handleMessage = useCallback(
		(event: MessageEvent) => {
			const message = event.data
			console.log("VoiceRecorder received message:", message.type, message.values)

			switch (message.type) {
				case "recordingStarted":
					if (message.values?.success) {
						console.log("Recording started successfully")
						setRecordingState("recording")
						setError(null)
					} else {
						console.error("Recording failed to start:", message.values?.error)
						setError(message.values?.error || "Failed to start recording")
						setRecordingState("idle")
					}
					isProcessingRef.current = false
					break

				case "recordingStopped":
					console.log("Recording stopped:", message.values)
					if (message.values?.success && message.values?.text) {
						console.log("Transcription received:", message.values.text)
						onTranscription(message.values.text)
						setError(null)
					} else if (message.values?.error) {
						console.error("Recording/transcription error:", message.values.error)
						setError(message.values.error)
					}
					setRecordingState("idle")
					isProcessingRef.current = false
					break

				case "recordingCancelled":
					console.log("Recording cancelled:", message.values)
					setRecordingState("idle")
					if (message.values?.error) {
						setError(message.values.error)
					}
					isProcessingRef.current = false
					break
			}
		},
		[onTranscription],
	)

	// Listen for messages from extension
	useEvent("message", handleMessage)

	const startRecording = useCallback(() => {
		console.log("Starting recording via extension host...")
		setError(null)
		setRecordingState("starting")
		isProcessingRef.current = true
		vscode.postMessage({ type: "startRecording" })
	}, [])

	const stopRecording = useCallback(() => {
		console.log("Stopping recording via extension host...")
		setRecordingState("processing")
		isProcessingRef.current = true
		vscode.postMessage({ type: "stopRecording", text: language })
	}, [language])

	const handleClick = useCallback(() => {
		console.log("VoiceRecorder button clicked!", { disabled, recordingState, error })

		if (disabled || isProcessingRef.current) {
			console.log("Click ignored - disabled or processing")
			return
		}

		// Clear error on click if there's an error
		if (error) {
			console.log("Clearing error:", error)
			setError(null)
			return
		}

		if (recordingState === "idle") {
			startRecording()
		} else if (recordingState === "recording") {
			stopRecording()
		}
	}, [disabled, recordingState, error, startRecording, stopRecording])

	const getTooltipContent = () => {
		if (error) return error
		if (recordingState === "processing") return t("chat:transcribing") || "Transcribing..."
		if (recordingState === "starting") return "Starting..."
		if (recordingState === "recording") return t("chat:stopRecording") || "Click to stop recording"
		return t("chat:voiceInput") || "Voice Input"
	}

	const getIcon = () => {
		if (recordingState === "processing" || recordingState === "starting") {
			return <Loader2 className="w-4 h-4 animate-spin" />
		}
		if (recordingState === "recording") {
			return <Square className="w-3 h-3" />
		}
		return <Mic className="w-4 h-4" />
	}

	const isDisabled = disabled || recordingState === "processing" || recordingState === "starting"

	return (
		<StandardTooltip content={getTooltipContent()}>
			<button
				aria-label={t("chat:voiceInput") || "Voice Input"}
				disabled={isDisabled}
				onClick={handleClick}
				className={cn(
					"relative inline-flex items-center justify-center",
					"bg-transparent border-none p-1.5",
					"rounded-md min-w-[28px] min-h-[28px]",
					"text-vscode-foreground opacity-85",
					"transition-all duration-150",
					"hover:opacity-100 hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]",
					"focus:outline-none focus-visible:ring-1 focus-visible:ring-vscode-focusBorder",
					"active:bg-[rgba(255,255,255,0.1)]",
					!isDisabled && "cursor-pointer",
					isDisabled &&
						"opacity-40 cursor-not-allowed grayscale-[30%] hover:bg-transparent hover:border-[rgba(255,255,255,0.08)] active:bg-transparent",
					recordingState === "recording" && "text-red-500 opacity-100 animate-pulse",
					error && "text-red-500 opacity-100",
				)}>
				{getIcon()}
			</button>
		</StandardTooltip>
	)
}

export default VoiceRecorder
