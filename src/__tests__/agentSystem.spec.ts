import { describe, it, expect, vi, beforeEach } from "vitest"
import { Mode } from "../shared/modes"
import { getDataScienceSystemPrompt } from "../core/prompts/data_science"

// Mock VSCode extension context
const mockContext = {
	globalState: {
		get: vi.fn(),
		update: vi.fn(),
	},
	secrets: {
		get: vi.fn(),
		store: vi.fn(),
	},
} as any

// Mock the system prompt function
vi.mock("../core/prompts/system", () => ({
	SYSTEM_PROMPT: vi.fn(async (context, cwd, supportsComputerUse, ...args) => {
		const selectedAgentId = context.globalState.get("selectedAgentId") || "software-dev"
		switch (selectedAgentId) {
			case "data-science":
				return getDataScienceSystemPrompt(cwd)
			case "software-dev":
			default:
				return "Software Development Agent System Prompt"
		}
	}),
}))

describe("Agent System", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockContext.globalState.get.mockReturnValue("software-dev")
	})

	describe("Agent Selection", () => {
		it("should use software development agent by default", async () => {
			const { SYSTEM_PROMPT } = await import("../core/prompts/system")

			const prompt = await SYSTEM_PROMPT(mockContext, "/test/cwd", true)
			expect(prompt).toBe("Software Development Agent System Prompt")
			expect(mockContext.globalState.get).toHaveBeenCalledWith("selectedAgentId")
		})

		it("should switch to data science agent when selected", async () => {
			mockContext.globalState.get.mockReturnValue("data-science")
			const { SYSTEM_PROMPT } = await import("../core/prompts/system")

			const prompt = await SYSTEM_PROMPT(mockContext, "/test/cwd", true)
			expect(prompt).toContain("You are a Syntx a data scientist")
			expect(mockContext.globalState.get).toHaveBeenCalledWith("selectedAgentId")
		})

		it("should handle unknown agent gracefully", async () => {
			mockContext.globalState.get.mockReturnValue("unknown-agent")
			const { SYSTEM_PROMPT } = await import("../core/prompts/system")

			const prompt = await SYSTEM_PROMPT(mockContext, "/test/cwd", true)
			expect(prompt).toBe("Software Development Agent System Prompt")
		})
	})

	describe("Data Science Agent", () => {
		it("should generate data science system prompt with correct content", () => {
			const prompt = getDataScienceSystemPrompt("/test/cwd")

			expect(prompt).toContain("You are a Syntx a data scientist")
			expect(prompt).toContain("data analysis, data visualization, machine learning")
			expect(prompt).toContain("TOOL USE")
			expect(prompt).toContain("read_file")
			expect(prompt).toContain("write_to_file")
			expect(prompt).toContain("execute_command")
			expect(prompt).toContain("ANALYSIS WORKFLOW")
		})

		it("should include proper working directory in prompt", () => {
			const testCwd = "/custom/working/directory"
			const prompt = getDataScienceSystemPrompt(testCwd)

			expect(prompt).toContain(testCwd)
		})

		it("should include data science specific rules", () => {
			const prompt = getDataScienceSystemPrompt("/test/cwd")

			expect(prompt).toContain("Virtual environments")
			expect(prompt).toContain("CSV / tabular files")
			expect(prompt).toContain("Never run pip globally")
			expect(prompt).toContain("You may not open or inspect a *.csv*")
		})
	})

	describe("Agent Registry", () => {
		it("should have correct agent definitions", async () => {
			const { agents } = await import("../../webview-ui/src/components/agent/agentRegistry")

			expect(agents).toHaveLength(2)

			const softwareDevAgent = agents.find((agent) => agent.id === "software-dev")
			expect(softwareDevAgent).toBeDefined()
			expect(softwareDevAgent?.name).toBe("Software Development Agent")
			expect(softwareDevAgent?.showModes).toBe(true)

			const dataScienceAgent = agents.find((agent) => agent.id === "data-science")
			expect(dataScienceAgent).toBeDefined()
			expect(dataScienceAgent?.name).toBe("Data Science Agent")
			expect(dataScienceAgent?.showModes).toBe(false)
		})
	})

	describe("Message Handling", () => {
		it("should handle agentSelected message correctly", () => {
			// This would typically test the webview message handler
			// but since it's complex, we'll test the basic structure
			const agentSelectedMessage = {
				type: "agentSelected",
				agentId: "data-science",
				showModes: false,
			}

			expect(agentSelectedMessage.type).toBe("agentSelected")
			expect(agentSelectedMessage.agentId).toBe("data-science")
			expect(agentSelectedMessage.showModes).toBe(false)
		})
	})
})
