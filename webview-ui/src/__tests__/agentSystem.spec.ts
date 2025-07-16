import { describe, it, expect } from "vitest"
import { agents } from "../components/agent/agentRegistry"

describe("Agent System - Webview Components", () => {
	describe("Agent Registry", () => {
		it("should have correct number of agents", () => {
			expect(agents).toHaveLength(2)
		})

		it("should have software development agent with correct properties", () => {
			const softwareDevAgent = agents.find((agent) => agent.id === "software-dev")

			expect(softwareDevAgent).toBeDefined()
			expect(softwareDevAgent?.id).toBe("software-dev")
			expect(softwareDevAgent?.name).toBe("Software Development Agent")
			expect(softwareDevAgent?.description).toContain("Specialized in coding tasks")
			expect(softwareDevAgent?.showModes).toBe(true)
		})

		it("should have data science agent with correct properties", () => {
			const dataScienceAgent = agents.find((agent) => agent.id === "data-science")

			expect(dataScienceAgent).toBeDefined()
			expect(dataScienceAgent?.id).toBe("data-science")
			expect(dataScienceAgent?.name).toBe("Data Science Agent")
			expect(dataScienceAgent?.description).toContain("Expert in data analysis")
			expect(dataScienceAgent?.showModes).toBe(false)
		})

		it("should have unique agent IDs", () => {
			const ids = agents.map((agent) => agent.id)
			const uniqueIds = Array.from(new Set(ids))
			expect(ids).toHaveLength(uniqueIds.length)
		})

		it("should have all required properties for each agent", () => {
			agents.forEach((agent) => {
				expect(agent).toHaveProperty("id")
				expect(agent).toHaveProperty("name")
				expect(agent).toHaveProperty("description")
				expect(agent).toHaveProperty("showModes")

				expect(typeof agent.id).toBe("string")
				expect(typeof agent.name).toBe("string")
				expect(typeof agent.description).toBe("string")
				expect(typeof agent.showModes).toBe("boolean")

				expect(agent.id.length).toBeGreaterThan(0)
				expect(agent.name.length).toBeGreaterThan(0)
				expect(agent.description.length).toBeGreaterThan(0)
			})
		})
	})

	describe("Agent System Integration", () => {
		it("should maintain agent state consistency", () => {
			const agentIds = agents.map((agent) => agent.id)

			expect(agentIds).toContain("software-dev")
			expect(agentIds).toContain("data-science")
			expect(agentIds).not.toContain("unknown-agent")
		})

		it("should handle showModes property correctly", () => {
			const softwareDevAgent = agents.find((agent) => agent.id === "software-dev")
			const dataScienceAgent = agents.find((agent) => agent.id === "data-science")

			expect(softwareDevAgent?.showModes).toBe(true)
			expect(dataScienceAgent?.showModes).toBe(false)
		})

		it("should validate agent message structure", () => {
			const testAgent = agents[0]
			const expectedMessage = {
				type: "agentSelected",
				agentId: testAgent.id,
				showModes: testAgent.showModes,
			}

			expect(expectedMessage).toHaveProperty("type", "agentSelected")
			expect(expectedMessage).toHaveProperty("agentId")
			expect(expectedMessage).toHaveProperty("showModes")
			expect(typeof expectedMessage.showModes).toBe("boolean")
		})

		it("should have consistent agent data structure", () => {
			const expectedKeys = ["id", "name", "description", "showModes"]

			agents.forEach((agent) => {
				const agentKeys = Object.keys(agent)
				expectedKeys.forEach((key) => {
					expect(agentKeys).toContain(key)
				})
			})
		})

		it("should have descriptive agent names and descriptions", () => {
			agents.forEach((agent) => {
				// Names should be descriptive and end with "Agent"
				expect(agent.name).toMatch(/Agent$/)

				// Descriptions should be meaningful
				expect(agent.description.length).toBeGreaterThan(20)

				// IDs should be kebab-case
				expect(agent.id).toMatch(/^[a-z]+(-[a-z]+)*$/)
			})
		})
	})

	describe("Agent Configuration Validation", () => {
		it("should have software development agent configured for modes", () => {
			const softwareDevAgent = agents.find((agent) => agent.id === "software-dev")
			expect(softwareDevAgent?.showModes).toBe(true)
		})

		it("should have data science agent configured without modes", () => {
			const dataScienceAgent = agents.find((agent) => agent.id === "data-science")
			expect(dataScienceAgent?.showModes).toBe(false)
		})

		it("should have proper agent descriptions for user understanding", () => {
			const softwareDevAgent = agents.find((agent) => agent.id === "software-dev")
			const dataScienceAgent = agents.find((agent) => agent.id === "data-science")

			expect(softwareDevAgent?.description).toContain("coding")
			expect(dataScienceAgent?.description).toContain("data")
		})
	})
})
