import { SarvamAIClient } from "sarvamai"
import { logger } from "../../utils/logging"

export class SarvamService {
	/**
	 * Convert text to speech using Sarvam AI
	 * @param text The text to convert to speech
	 * @param targetLanguage The target language code (e.g., "hi-IN")
	 * @param apiKey The Sarvam AI API key
	 * @returns Audio data as base64 string or error
	 */
	async textToSpeech(
		text: string,
		targetLanguage: string,
		apiKey: string,
	): Promise<{ audio?: string; error?: string }> {
		try {
			if (!apiKey) {
				return { error: "Sarvam API key is not configured" }
			}

			const client = new SarvamAIClient({ apiSubscriptionKey: apiKey })

			const response = await client.textToSpeech.convert({
				text: text,
				target_language_code: targetLanguage as any,
			})

			// Response contains audio data
			if (response && response.audios && response.audios.length > 0) {
				return { audio: response.audios[0] }
			}

			return { error: "No audio data received from Sarvam AI" }
		} catch (error) {
			const errorMessage = this.parseError(error)
			logger.error(`Text-to-speech error: ${errorMessage}`)
			return { error: errorMessage }
		}
	}

	/**
	 * Translate text using Sarvam AI
	 * @param text The text to translate
	 * @param targetLanguage The target language code (e.g., "hi-IN")
	 * @param apiKey The Sarvam AI API key
	 * @param sourceLanguage The source language code (defaults to "en-IN")
	 * @returns Translated text or error
	 */
	async translate(
		text: string,
		targetLanguage: string,
		apiKey: string,
		sourceLanguage: string = "en-IN",
	): Promise<{ translatedText?: string; error?: string }> {
		try {
			if (!apiKey) {
				return { error: "Sarvam API key is not configured" }
			}

			const client = new SarvamAIClient({ apiSubscriptionKey: apiKey })

			const response = await client.text.translate({
				input: text,
				source_language_code: sourceLanguage as any,
				target_language_code: targetLanguage as any,
			})

			if (response && response.translated_text) {
				return { translatedText: response.translated_text }
			}

			return { error: "No translation received from Sarvam AI" }
		} catch (error) {
			const errorMessage = this.parseError(error)
			logger.error(`Translation error: ${errorMessage}`)
			return { error: errorMessage }
		}
	}

	/**
	 * Parse error from Sarvam AI API response
	 */
	private parseError(error: unknown): string {
		if (error instanceof Error) {
			// Try to parse Sarvam API error format
			try {
				const parsed = JSON.parse(error.message)
				if (parsed.error) {
					return parsed.error.message || parsed.error.code || error.message
				}
			} catch {
				// Not JSON, return original message
			}
			return error.message
		}
		return String(error)
	}
}

// Singleton instance
let sarvamServiceInstance: SarvamService | null = null

export function getSarvamService(): SarvamService {
	if (!sarvamServiceInstance) {
		sarvamServiceInstance = new SarvamService()
	}
	return sarvamServiceInstance
}
