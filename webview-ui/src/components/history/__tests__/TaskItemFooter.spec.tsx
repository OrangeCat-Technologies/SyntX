import { render, screen } from "@/utils/test-utils"

import TaskItemFooter from "../TaskItemFooter"

vi.mock("@src/i18n/TranslationContext", () => ({
	useAppTranslation: () => ({
		t: (key: string) => key,
	}),
}))

// Mock ExtensionStateContext to simulate SyntX provider
vi.mock("@src/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		apiConfiguration: {
			apiProvider: "syntx",
		},
	}),
}))

const mockItem = {
	id: "1",
	number: 1,
	task: "Test task",
	ts: Date.now(),
	tokensIn: 100,
	tokensOut: 50,
	totalCost: 0.002,
	workspace: "/test/workspace",
}

describe("TaskItemFooter", () => {
	it("does not render token information for SyntX provider", () => {
		render(<TaskItemFooter item={mockItem} variant="full" />)

		// For SyntX provider, token information should be hidden
		expect(screen.queryByTestId("tokens-in-footer-compact")).not.toBeInTheDocument()
		expect(screen.queryByTestId("tokens-out-footer-compact")).not.toBeInTheDocument()
	})

	it("does not render cost information for SyntX provider", () => {
		render(<TaskItemFooter item={mockItem} variant="full" />)

		// For SyntX provider, cost information should be hidden
		expect(screen.queryByText("$0.00")).not.toBeInTheDocument()
	})

	it("shows action buttons", () => {
		render(<TaskItemFooter item={mockItem} variant="full" />)

		// Should show copy and export buttons
		expect(screen.getByTestId("copy-prompt-button")).toBeInTheDocument()
		expect(screen.getByTestId("export")).toBeInTheDocument()
	})

	it("renders cache information when present", () => {
		const mockItemWithCache = {
			...mockItem,
			cacheReads: 5,
			cacheWrites: 3,
		}

		render(<TaskItemFooter item={mockItemWithCache} variant="full" />)

		// Check for cache display using testid
		expect(screen.getByTestId("cache-compact")).toBeInTheDocument()
		expect(screen.getByText("3")).toBeInTheDocument() // cache writes
		expect(screen.getByText("5")).toBeInTheDocument() // cache reads
	})

	it("does not render cache information when not present", () => {
		const mockItemWithoutCache = {
			...mockItem,
			cacheReads: 0,
			cacheWrites: 0,
		}

		render(<TaskItemFooter item={mockItemWithoutCache} variant="full" />)

		// Cache section should not be present
		expect(screen.queryByTestId("cache-compact")).not.toBeInTheDocument()
	})
})
