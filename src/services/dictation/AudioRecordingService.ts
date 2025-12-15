import { ChildProcess, spawn } from "node:child_process"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"

function isExecutable(filePath: string): boolean {
	try {
		fs.accessSync(filePath, fs.constants.X_OK)
		return true
	} catch {
		return false
	}
}

// Platform-specific FFmpeg configuration
const AUDIO_PROGRAM_CONFIG = {
	darwin: {
		command: "ffmpeg",
		fallbackPaths: ["/usr/local/bin/ffmpeg", "/opt/homebrew/bin/ffmpeg"],
		getArgs: (outputFile: string, _ffmpegPath?: string) => [
			"-f",
			"avfoundation",
			"-i",
			":default", // Use system's default microphone instead of :0 which may be wrong device
			"-acodec",
			"libopus",
			"-ar",
			"16000",
			"-ac",
			"1",
			"-y",
			outputFile,
		],
		error: "FFmpeg is required for voice recording but is not installed on your system.",
		installCommand: "brew install ffmpeg",
		dependencyName: "FFmpeg",
		installDescription: "Install FFmpeg using Homebrew",
	},
	win32: {
		command: "ffmpeg.exe",
		fallbackPaths: ["C:\\ffmpeg\\bin\\ffmpeg.exe"],
		getArgs: async (outputFile: string, ffmpegPath?: string) => {
			// Detect the actual audio device name on Windows
			// If ffmpegPath is not provided, we'll use fallback device name
			const deviceName = ffmpegPath ? await detectWindowsAudioDevice(ffmpegPath) : "Microphone"
			return [
				"-f",
				"dshow",
				"-i",
				`audio=${deviceName}`,
				"-acodec",
				"libopus",
				"-ar",
				"16000",
				"-ac",
				"1",
				"-y",
				outputFile,
			]
		},
		error: "FFmpeg is required for voice recording but is not installed on your system.",
		installCommand: "winget install ffmpeg",
		dependencyName: "FFmpeg",
		installDescription: "Install FFmpeg using winget or download from ffmpeg.org",
	},
	linux: {
		command: "ffmpeg",
		fallbackPaths: ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg"],
		getArgs: (outputFile: string, _ffmpegPath?: string) => [
			"-f",
			"pulse",
			"-i",
			"default",
			"-acodec",
			"libopus",
			"-ar",
			"16000",
			"-ac",
			"1",
			"-y",
			outputFile,
		],
		error: "FFmpeg is required for voice recording but is not installed on your system.",
		installCommand: "sudo apt install ffmpeg",
		dependencyName: "FFmpeg",
		installDescription: "Install FFmpeg using your package manager",
	},
} as const

/**
 * Detects the default audio input device on Windows by listing DirectShow devices
 * Falls back to common device names if detection fails
 */
async function detectWindowsAudioDevice(ffmpegPath: string): Promise<string> {
	return new Promise((resolve) => {
		// Try to list DirectShow audio devices
		const listProcess = spawn(ffmpegPath, ["-list_devices", "true", "-f", "dshow", "-i", "dummy"])

		let stderrOutput = ""
		let stdoutOutput = ""
		let resolved = false

		// Helper function to resolve only once and clear timeout
		const resolveOnce = (deviceName: string) => {
			if (!resolved) {
				resolved = true
				clearTimeout(timeoutId)
				resolve(deviceName)
			}
		}

		// Helper function to try parsing device name from current output
		const tryDetectDevice = (output: string): string | null => {
			// Pattern 1: Look for devices with (audio) marker after the device name
			// Matches: [dshow @ ...] "Device Name" (audio)
			const audioDevicePattern = /\[dshow @ [^\]]+\]\s+"([^"]+)"\s*\(audio\)/gi
			const matches = Array.from(output.matchAll(audioDevicePattern))

			if (matches.length > 0) {
				return matches[0][1]
			}

			// Pattern 2: Look for any quoted device name followed by (audio) anywhere in the output
			const altPattern = /"([^"]+)"\s*\(audio\)/gi
			const altMatches = Array.from(output.matchAll(altPattern))

			if (altMatches.length > 0) {
				return altMatches[0][1]
			}

			return null
		}

		listProcess.stderr?.on("data", (data) => {
			if (resolved) return
			stderrOutput += data.toString()

			// Try to detect device name as soon as we see it in the output
			const output = stderrOutput + stdoutOutput
			const deviceName = tryDetectDevice(output)
			if (deviceName) {
				console.log(`Detected Windows audio device (early): ${deviceName}`)
				resolveOnce(deviceName)
			}
		})

		listProcess.stdout?.on("data", (data) => {
			if (resolved) return
			stdoutOutput += data.toString()

			// Try to detect device name as soon as we see it in the output
			const output = stderrOutput + stdoutOutput
			const deviceName = tryDetectDevice(output)
			if (deviceName) {
				console.log(`Detected Windows audio device (early): ${deviceName}`)
				resolveOnce(deviceName)
			}
		})

		listProcess.on("exit", (code) => {
			if (resolved) return

			// Parse the output to find audio devices
			// FFmpeg outputs device list to stderr in format:
			// [dshow @ ...]  "Device Name" (audio)
			// Example: [dshow @ 0000027dde7389c0] "Microphone Array (Qualcomm(R) Aqstic(TM) ACX Static Endpoints Audio Device)" (audio)
			const output = stderrOutput + stdoutOutput

			console.log("FFmpeg device list output:", output.substring(0, 1000))

			// Pattern 1: Look for devices with (audio) marker after the device name
			// Matches: [dshow @ ...] "Device Name" (audio)
			const audioDevicePattern = /\[dshow @ [^\]]+\]\s+"([^"]+)"\s*\(audio\)/gi
			const matches = Array.from(output.matchAll(audioDevicePattern))

			if (matches.length > 0) {
				// Use the first available audio device
				const deviceName = matches[0][1]
				console.log(`Detected Windows audio device: ${deviceName}`)
				resolveOnce(deviceName)
				return
			}

			// Pattern 2: Look for any quoted device name followed by (audio) anywhere in the output
			// This is a fallback in case the dshow prefix format differs
			const altPattern = /"([^"]+)"\s*\(audio\)/gi
			const altMatches = Array.from(output.matchAll(altPattern))

			if (altMatches.length > 0) {
				const deviceName = altMatches[0][1]
				console.log(`Detected Windows audio device (alt format): ${deviceName}`)
				resolveOnce(deviceName)
				return
			}

			// Pattern 3: Look for devices in the "DirectShow audio devices" section
			// Sometimes devices are listed without the (audio) marker
			const dshowSection = output.split("DirectShow audio devices")[1] || output
			const devicePattern = /\[dshow @ [^\]]+\]\s+"([^"]+)"/gi
			const deviceMatches = Array.from(dshowSection.matchAll(devicePattern))

			if (deviceMatches.length > 0) {
				const deviceName = deviceMatches[0][1]
				console.log(`Detected Windows audio device (from dshow section): ${deviceName}`)
				resolveOnce(deviceName)
				return
			}

			// Fallback: try common device names
			const fallbackDevices = ["Microphone", "Microphone Array", "Default Audio Device", "default"]

			console.warn(
				`Could not detect audio device automatically (exit code: ${code}), trying fallback names. Full output:`,
				output,
			)
			resolveOnce(fallbackDevices[0]) // Will try Microphone first, which may still work
		})

		listProcess.on("error", () => {
			if (resolved) return
			// If listing fails, fall back to default
			console.warn("Failed to list audio devices, using fallback")
			resolveOnce("Microphone")
		})

		// Set a timeout to avoid hanging
		const timeoutId = setTimeout(() => {
			if (!resolved && !listProcess.killed) {
				listProcess.kill()
				console.warn("Device detection timed out, using fallback")
				resolveOnce("Microphone")
			}
		}, 3000)
	})
}

export class AudioRecordingService {
	private recordingProcess: ChildProcess | null = null
	private startTime: number = 0
	private outputFile: string = ""

	constructor() {}

	private get isRecording(): boolean {
		return (
			this.recordingProcess !== null && !this.recordingProcess.killed && this.recordingProcess.exitCode === null
		)
	}

	private resetRecordingState(): void {
		this.recordingProcess = null
		this.startTime = 0
	}

	private async cleanupTempFile(): Promise<void> {
		if (this.outputFile && fs.existsSync(this.outputFile)) {
			try {
				fs.unlinkSync(this.outputFile)
				console.log("Temporary audio file cleaned up")
			} catch (error) {
				console.warn("Failed to cleanup temporary audio file:", error)
			} finally {
				this.outputFile = ""
			}
		}
	}

	private async terminateProcess(): Promise<void> {
		if (!this.recordingProcess) {
			return
		}

		console.log("Terminating recording process...")

		// On Windows, FFmpeg with dshow needs 'q' sent to stdin for graceful shutdown
		// This ensures the file is properly flushed and finalized
		const platform = os.platform()
		if (platform === "win32") {
			try {
				// Send 'q' to stdin to gracefully stop FFmpeg
				if (this.recordingProcess.stdin && !this.recordingProcess.stdin.destroyed) {
					this.recordingProcess.stdin.write("q\n")
					this.recordingProcess.stdin.end()
				}
			} catch (error) {
				console.warn("Failed to send quit signal to FFmpeg:", error)
				// Fall back to kill if stdin write fails
				this.recordingProcess.kill("SIGTERM")
			}
		} else {
			// On macOS/Linux, SIGINT works fine
			this.recordingProcess.kill("SIGINT")
		}

		await new Promise<void>((resolve) => {
			const timeoutId = setTimeout(() => {
				console.warn("Process termination timed out after 5 seconds, forcing kill")
				if (this.recordingProcess && !this.recordingProcess.killed) {
					this.recordingProcess.kill("SIGKILL")
				}
				resolve()
			}, 5000)

			this.recordingProcess?.on("exit", (code) => {
				clearTimeout(timeoutId)
				console.log(`Recording process exited with code: ${code}`)
				resolve()
			})
		})
	}

	private async performCleanup(options?: { keepFile?: boolean }): Promise<void> {
		await this.terminateProcess()
		this.resetRecordingState()

		if (!options?.keepFile) {
			await this.cleanupTempFile()
		}
	}

	async startRecording(): Promise<{ success: boolean; error?: string }> {
		try {
			if (this.recordingProcess || this.outputFile) {
				console.log("Performing pre-recording cleanup of stale resources...")
				await this.performCleanup()
			}

			if (this.isRecording) {
				return { success: false, error: "Already recording" }
			}

			const checkResult = this.checkRecordingDependencies()
			if (!checkResult.available) {
				return { success: false, error: checkResult.error }
			}

			const tempDir = os.tmpdir()
			this.outputFile = path.join(tempDir, `syntx_recording_${Date.now()}.webm`)

			console.log("Starting audio recording...")

			const recordProgram = this.getRecordProgram()
			if (!recordProgram) {
				return { success: false, error: "Recording program not found" }
			}
			console.log(`Using recording program: ${recordProgram.path}`)

			const argsResult = recordProgram.getArgs(this.outputFile, recordProgram.path)
			const args = argsResult instanceof Promise ? await argsResult : argsResult

			// On Windows, ensure stdin is available so we can send 'q' to gracefully stop FFmpeg
			const spawnOptions: { stdio?: ("pipe" | "inherit" | "ignore")[] } =
				os.platform() === "win32" ? { stdio: ["pipe", "pipe", "pipe"] } : {}
			this.recordingProcess = spawn(recordProgram.path, args, spawnOptions)
			this.startTime = Date.now()

			if (!this.recordingProcess) {
				return { success: false, error: "Failed to spawn recording process" }
			}

			this.recordingProcess.on("error", (error) => {
				console.error(`Recording process error: ${error.message}`)
				this.resetRecordingState()
			})

			this.recordingProcess.on("exit", (code) => {
				if (code !== 0 && code !== null) {
					console.warn(`Recording process exited with code: ${code}`)
				}
			})

			this.recordingProcess.stderr?.on("data", (data) => {
				const message = data.toString().trim()
				if (message && !message.includes("In:") && !message.includes("Out:")) {
					console.log(`Recording stderr: ${message}`)
				}
			})

			console.log("Audio recording started successfully")
			return { success: true }
		} catch (error) {
			await this.performCleanup()
			const errorMessage = error instanceof Error ? error.message : String(error)
			console.error("Failed to start audio recording:", errorMessage)
			return { success: false, error: `Failed to start recording: ${errorMessage}` }
		}
	}

	async stopRecording(): Promise<{ success: boolean; audioBase64?: string; error?: string }> {
		try {
			if (!this.isRecording) {
				return { success: false, error: "Not currently recording" }
			}

			console.log("Stopping audio recording...")

			// Save the output file path before resetting state
			const outputFilePath = this.outputFile

			await this.terminateProcess()
			this.resetRecordingState()

			// Wait for file to be fully written and flushed
			// Windows may need more time for FFmpeg to finalize the file
			const platform = os.platform()
			const waitTime = platform === "win32" ? 1500 : 500
			await new Promise((resolve) => setTimeout(resolve, waitTime))

			if (!outputFilePath) {
				return { success: false, error: "Recording file path not found" }
			}

			// Wait for file to exist and have content (with retries on Windows)
			let retries = platform === "win32" ? 10 : 3
			while (retries > 0) {
				if (fs.existsSync(outputFilePath)) {
					const stats = fs.statSync(outputFilePath)
					if (stats.size > 0) {
						break
					}
				}
				retries--
				if (retries > 0) {
					await new Promise((resolve) => setTimeout(resolve, 200))
				}
			}

			if (!fs.existsSync(outputFilePath)) {
				return { success: false, error: "Recording file not found" }
			}

			const stats = fs.statSync(outputFilePath)
			if (stats.size === 0) {
				return { success: false, error: "Recording file is empty - no audio was captured" }
			}

			const audioBuffer = fs.readFileSync(outputFilePath)
			const audioBase64 = audioBuffer.toString("base64")

			console.log(`Audio file size: ${stats.size} bytes, base64 length: ${audioBase64.length}`)

			// Clean up the temp file
			try {
				fs.unlinkSync(outputFilePath)
				console.log("Temporary audio file cleaned up")
			} catch (error) {
				console.warn("Failed to cleanup temporary audio file:", error)
			}
			this.outputFile = ""

			console.log("Audio recording stopped and converted to base64")
			return { success: true, audioBase64 }
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			console.error("Failed to stop audio recording:", errorMessage)
			await this.performCleanup()
			return { success: false, error: `Failed to stop recording: ${errorMessage}` }
		}
	}

	async cancelRecording(): Promise<{ success: boolean; error?: string }> {
		try {
			if (!this.isRecording) {
				return { success: false, error: "Not currently recording" }
			}

			console.log("Canceling audio recording...")
			await this.performCleanup()
			console.log("Audio recording canceled successfully")
			return { success: true }
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			console.error("Failed to cancel audio recording:", errorMessage)
			await this.performCleanup()
			return { success: false, error: `Failed to cancel recording: ${errorMessage}` }
		}
	}

	getRecordingStatus(): { isRecording: boolean; durationSeconds: number } {
		const durationSeconds = this.isRecording ? (Date.now() - this.startTime) / 1000 : 0
		return {
			isRecording: this.isRecording,
			durationSeconds,
		}
	}

	private checkRecordingDependencies(): { available: boolean; error?: string } {
		const program = this.getRecordProgram()
		if (!program) {
			const platform = os.platform() as keyof typeof AUDIO_PROGRAM_CONFIG
			const config = AUDIO_PROGRAM_CONFIG[platform]
			const error = config ? config.error : `Audio recording is not supported on platform: ${platform}`
			return { available: false, error }
		}
		return { available: true }
	}

	private getRecordProgram():
		| { path: string; getArgs: (outputFile: string, ffmpegPath?: string) => string[] | Promise<string[]> }
		| undefined {
		const platform = os.platform() as keyof typeof AUDIO_PROGRAM_CONFIG
		const config = AUDIO_PROGRAM_CONFIG[platform]

		if (!config) {
			return undefined
		}

		// Check if the command is in the system's PATH
		const pathDirs = (process.env.PATH || "").split(path.delimiter)
		for (const dir of pathDirs) {
			const fullPath = path.join(dir, config.command)
			if (fs.existsSync(fullPath) && isExecutable(fullPath)) {
				return { path: fullPath, getArgs: config.getArgs }
			}
		}

		// Check fallback paths
		for (const p of config.fallbackPaths) {
			if (fs.existsSync(p) && isExecutable(p)) {
				return { path: p, getArgs: config.getArgs }
			}
		}

		return undefined
	}

	cleanup(): void {
		this.performCleanup().catch((error) => {
			console.error("Error during cleanup:", error)
		})
	}
}

export const audioRecordingService = new AudioRecordingService()
