/**
 * OpenAI Whisper API Service for Speech-to-Text Transcription
 *
 * This service handles audio transcription using OpenAI's Whisper API.
 * Note: API key is hardcoded as per project requirements.
 */

// OpenAI API Key - Replace with your actual API key
const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || ""

const WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions"

export interface TranscriptionResult {
	text: string
	error?: string
}

/**
 * Transcribes audio using OpenAI's Whisper API
 * @param audioBlob - The audio blob to transcribe (WebM format from MediaRecorder)
 * @param language - Optional language code (e.g., "en" for English)
 * @returns Promise with transcription result
 */
export async function transcribeAudio(audioBlob: Blob, language?: string): Promise<TranscriptionResult> {
	console.log(`Transcribing audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`)
	try {
		// Create form data for the API request
		const formData = new FormData()

		// Append audio file - Whisper API accepts various formats including webm
		formData.append("file", audioBlob, "recording.webm")
		formData.append("model", "whisper-1")

		// Add optional language parameter
		if (language) {
			formData.append("language", language)
		}

		console.log("Sending POST request to Whisper API...")
		const response = await fetch(WHISPER_API_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: formData,
		})

		console.log(`Whisper API response status: ${response.status}`)

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			const errorMessage = errorData.error?.message || `API error: ${response.status}`
			console.error("Whisper API error:", errorMessage)

			// Handle specific error cases
			if (response.status === 401) {
				return { text: "", error: "Invalid API key. Please check your OpenAI API key." }
			}
			if (response.status === 429) {
				return { text: "", error: "Rate limit exceeded. Please try again later." }
			}
			if (response.status === 400) {
				console.error("Whisper API error:", errorMessage)
				return { text: "", error: "Invalid audio format or empty recording." }
			}

			return { text: "", error: errorMessage }
		}

		const data = await response.json()
		return { text: data.text || "" }
	} catch (error) {
		console.error("Whisper transcription error:", error)

		if (error instanceof TypeError && error.message.includes("fetch")) {
			return { text: "", error: "Network error. Please check your internet connection." }
		}

		return {
			text: "",
			error: error instanceof Error ? error.message : "Transcription failed. Please try again.",
		}
	}
}

/**
 * Check if the API key has been configured
 */
export function isApiKeyConfigured(): boolean {
	return OPENAI_API_KEY !== "sk-your-openai-api-key-here" && OPENAI_API_KEY.startsWith("sk-")
}
