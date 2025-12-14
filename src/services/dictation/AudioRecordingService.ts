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
		getArgs: (outputFile: string) => [
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
		getArgs: (outputFile: string) => [
			"-f",
			"dshow",
			"-i",
			"audio=Microphone",
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
		installCommand: "winget install ffmpeg",
		dependencyName: "FFmpeg",
		installDescription: "Install FFmpeg using winget or download from ffmpeg.org",
	},
	linux: {
		command: "ffmpeg",
		fallbackPaths: ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg"],
		getArgs: (outputFile: string) => [
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
		this.recordingProcess.kill("SIGINT")

		await new Promise<void>((resolve) => {
			const timeoutId = setTimeout(() => {
				console.warn("Process termination timed out after 5 seconds")
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

			const args = recordProgram.getArgs(this.outputFile)

			this.recordingProcess = spawn(recordProgram.path, args)
			this.startTime = Date.now()

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

			await this.terminateProcess()
			this.resetRecordingState()

			// Wait for file to be fully written
			await new Promise((resolve) => setTimeout(resolve, 500))

			if (!fs.existsSync(this.outputFile)) {
				return { success: false, error: "Recording file not found" }
			}

			const audioBuffer = fs.readFileSync(this.outputFile)
			const audioBase64 = audioBuffer.toString("base64")

			await this.cleanupTempFile()

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

	private getRecordProgram(): { path: string; getArgs: (outputFile: string) => string[] } | undefined {
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
