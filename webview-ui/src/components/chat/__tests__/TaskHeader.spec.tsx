// npx vitest src/components/chat/__tests__/TaskHeader.spec.tsx

import React from "react"
import { render, screen, fireEvent } from "@/utils/test-utils"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import type { ProviderSettings } from "@roo-code/types"

import TaskHeader, { TaskHeaderProps } from "../TaskHeader"

// Mock i18n
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key, // Simple mock that returns the key
	}),
	// Mock initReactI18next to prevent initialization errors in tests
	initReactI18next: {
		type: "3rdParty",
		init: vi.fn(),
	},
}))

// Mock the vscode API
vi.mock("@/utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

// Mock the VSCodeBadge component
vi.mock("@vscode/webview-ui-toolkit/react", () => ({
	VSCodeBadge: ({ children }: { children: React.ReactNode }) => <div data-testid="vscode-badge">{children}</div>,
}))

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
	FoldVertical: ({ size }: { size?: number }) => (
		<svg data-testid="fold-vertical-icon" className="lucide-fold-vertical" width={size} height={size}></svg>
	),
	CloudUpload: ({ size }: { size?: number }) => (
		<svg data-testid="cloud-upload-icon" width={size} height={size}></svg>
	),
	CloudDownload: ({ size }: { size?: number }) => (
		<svg data-testid="cloud-download-icon" width={size} height={size}></svg>
	),
	XIcon: ({ size }: { size?: number }) => <svg data-testid="x-icon" width={size} height={size}></svg>,
	X: ({ size }: { size?: number }) => <svg data-testid="x-icon" width={size} height={size}></svg>,
}))

// Mock useSelectedModel hook
vi.mock("@/components/ui/hooks/useSelectedModel", () => ({
	useSelectedModel: vi.fn(() => ({
		id: "test-model",
		info: { contextWindow: 4000 },
	})),
}))

// Mock format utilities
vi.mock("@src/utils/format", () => ({
	formatLargeNumber: vi.fn((num) => num.toString()),
}))

// Mock react-use
vi.mock("react-use", () => ({
	useWindowSize: () => ({ width: 800, height: 600 }),
}))

// Mock the ExtensionStateContext
vi.mock("@src/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		apiConfiguration: {
			apiProvider: "anthropic",
			apiKey: "test-api-key", // Add relevant fields
			apiModelId: "claude-3-opus-20240229", // Add relevant fields
		} as ProviderSettings, // Optional: Add type assertion if ProviderSettings is imported
		currentTaskItem: { id: "test-task-id" },
	}),
}))

describe("TaskHeader", () => {
	const defaultProps: TaskHeaderProps = {
		task: { type: "say", ts: Date.now(), text: "Test task", images: [] },
		tokensIn: 100,
		tokensOut: 50,
		totalCost: 0.05,
		contextTokens: 200,
		buttonsDisabled: false,
		handleCondenseContext: vi.fn(),
		onClose: vi.fn(),
	}

	const queryClient = new QueryClient()

	const renderTaskHeader = (props: Partial<TaskHeaderProps> = {}) => {
		return render(
			<QueryClientProvider client={queryClient}>
				<TaskHeader {...defaultProps} {...props} />
			</QueryClientProvider>,
		)
	}

	it("should display cost when totalCost is greater than 0", () => {
		renderTaskHeader()
		// The cost should be displayed in the expanded view
		// Elements are visible in collapsed state
		expect(screen.getByText("$0.05")).toBeInTheDocument()
	})

	it("should not display cost when totalCost is 0", () => {
		renderTaskHeader({ totalCost: 0 })
		expect(screen.queryByText("$0.0000")).not.toBeInTheDocument()
	})

	it("should not display cost when totalCost is null", () => {
		renderTaskHeader({ totalCost: null as any })
		expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
	})

	it("should not display cost when totalCost is undefined", () => {
		renderTaskHeader({ totalCost: undefined as any })
		expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
	})

	it("should not display cost when totalCost is NaN", () => {
		renderTaskHeader({ totalCost: NaN })
		expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
	})

	it("should render the condense context button", () => {
		renderTaskHeader()
		// The condense button should be available when contextWindow > 0 and in expanded state
		// Elements are visible in collapsed state

		// Find the button that contains the FoldVertical icon
		const condenseIcon = screen.getByTestId("fold-vertical-icon")
		expect(condenseIcon).toBeInTheDocument()
	})

	it("should call handleCondenseContext when condense context button is clicked", () => {
		const handleCondenseContext = vi.fn()
		renderTaskHeader({ handleCondenseContext })

		// Elements are visible in collapsed state

		// Find the button that contains the FoldVertical icon
		const condenseIcon = screen.getByTestId("fold-vertical-icon")
		const condenseButton = condenseIcon.closest("button")
		expect(condenseButton).toBeDefined()
		fireEvent.click(condenseButton!)
		expect(handleCondenseContext).toHaveBeenCalledWith("test-task-id")
	})

	it("should disable the condense context button when buttonsDisabled is true", () => {
		const handleCondenseContext = vi.fn()
		renderTaskHeader({ buttonsDisabled: true, handleCondenseContext })

		// Elements are visible in collapsed state

		// Find the button that contains the FoldVertical icon
		const condenseIcon = screen.getByTestId("fold-vertical-icon")
		const condenseButton = condenseIcon.closest("button")
		expect(condenseButton).toBeDefined()
		expect(condenseButton).toBeDisabled()
		fireEvent.click(condenseButton!)
		expect(handleCondenseContext).not.toHaveBeenCalled()
	})
})
