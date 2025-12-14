import { createReadStream } from "fs"
import { SarvamAIClient } from "sarvamai"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

export class VoiceTranscriptionService {
	private apiKey: string

	constructor(apiKey?: string) {
		// Use provided API key, fallback to empty string if no API key provided
		//this.apiKey = apiKey || process.env.SARVAM_API_KEY || ""
		this.apiKey = apiKey || ""
	}

	async transcribeAudio(audioBase64: string, language?: string): Promise<{ text?: string; error?: string }> {
		let tempFilePath: string | null = null

		try {
			if (!this.apiKey || this.apiKey.trim() === "") {
				return { error: "SarvamAI API key is not configured. Please provide an API key in settings." }
			}

			console.log("Transcribing audio with SarvamAI...")

			// Create client with the API key
			const client = new SarvamAIClient({ apiSubscriptionKey: this.apiKey })

			// Convert base64 to Buffer
			const audioBuffer = Buffer.from(audioBase64, "base64")

			// Create a temporary file to store the audio
			const tempDir = os.tmpdir()
			tempFilePath = path.join(tempDir, `recording-${Date.now()}.webm`)

			// Write buffer to temporary file
			await fs.promises.writeFile(tempFilePath, audioBuffer)

			// Map language codes to BCP-47 format for SarvamAI
			// Default to "en-IN" (English-India) if no language is specified
			// Valid values: unknown, hi-IN, bn-IN, kn-IN, ml-IN, mr-IN, od-IN, pa-IN, ta-IN, te-IN, en-IN, gu-IN
			// type SarvamLanguageCode = "unknown" | "hi-IN" | "bn-IN" | "kn-IN" | "ml-IN" | "mr-IN" | "od-IN" | "pa-IN" | "ta-IN" | "te-IN" | "en-IN" | "gu-IN"
			// const languageCode: SarvamLanguageCode = language === "en" ? "en-IN" : (language as SarvamLanguageCode || "en-IN")

			//console.log(`Using language code: ${languageCode}`)

			// Create read stream and transcribe
			const response = await client.speechToText.translate({
				file: fs.createReadStream(tempFilePath),
				//language_code: languageCode,
			})

			console.log("Transcription successful:", response)

			// Clean up temp file
			if (tempFilePath) {
				await fs.promises.unlink(tempFilePath).catch((err) => console.error("Error deleting temp file:", err))
			}

			// Check if we got a transcript
			if (!response.transcript || response.transcript.trim() === "") {
				console.warn("Empty transcript received. Detected language:", response.language_code)
				return {
					text: "",
					error: `No speech detected. You may want to try speaking more clearly or checking your microphone.`,
				}
			}

			return { text: response.transcript || "" }
		} catch (error) {
			console.error("Voice transcription error:", error)

			// Clean up temp file in case of error
			if (tempFilePath) {
				await fs.promises.unlink(tempFilePath).catch((err) => console.error("Error deleting temp file:", err))
			}

			return this.parseTranscriptionError(error)
		}
	}

	private parseTranscriptionError(error: unknown): { error: string } {
		if (error && typeof error === "object" && "response" in error) {
			const httpError = error as any
			const status = httpError.response?.status
			const message = httpError.response?.data?.error?.message || httpError.message

			if (status === 401) {
				return { error: "Invalid API key. Please check your SarvamAI API key." }
			}
			if (status === 429) {
				return { error: "Rate limit exceeded. Please try again later." }
			}
			if (status === 400) {
				return { error: "Invalid audio format or empty recording." }
			}

			return { error: message || "Transcription failed" }
		}

		const errorMessage = error instanceof Error ? error.message : String(error)
		return { error: `Transcription error: ${errorMessage}` }
	}
}

let _voiceTranscriptionServiceInstance: VoiceTranscriptionService | null = null
let _lastApiKey: string | undefined = undefined

export function getVoiceTranscriptionService(apiKey?: string): VoiceTranscriptionService {
	// If no instance exists, or API key is provided and different from last used, create a new instance
	if (!_voiceTranscriptionServiceInstance || (apiKey && _lastApiKey !== apiKey)) {
		_voiceTranscriptionServiceInstance = new VoiceTranscriptionService(apiKey)
		_lastApiKey = apiKey
	}
	return _voiceTranscriptionServiceInstance
}
