import { render, fireEvent, screen } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"
import { ShareButton } from "../ShareButton"
import { TaskActions } from "../TaskActions"
import { vscode } from "../../../utils/vscode"
import { useExtensionState } from "../../../context/ExtensionStateContext"

vi.mock("../../../utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

vi.mock("../../../context/ExtensionStateContext", () => ({
	useExtensionState: vi.fn(),
}))

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	initReactI18next: {
		type: "3rdParty",
		init: vi.fn(),
	},
}))

// Mock pretty-bytes
vi.mock("pretty-bytes", () => ({
	default: (bytes: number) => `${bytes} B`,
}))

// Mock UI components
vi.mock("@/components/ui", () => ({
	Button: ({ children, onClick, ...props }: any) => (
		<button onClick={onClick} {...props}>
			{children}
		</button>
	),
	Popover: ({ children }: any) => <div>{children}</div>,
	PopoverContent: ({ children }: any) => <div>{children}</div>,
	PopoverTrigger: ({ children }: any) => <div>{children}</div>,
	StandardTooltip: ({ children }: any) => <div>{children}</div>,
	Command: ({ children }: any) => <div>{children}</div>,
	CommandList: ({ children }: any) => <div>{children}</div>,
	CommandItem: ({ children }: any) => <div>{children}</div>,
	CommandGroup: ({ children }: any) => <div>{children}</div>,
	Dialog: ({ children }: any) => <div>{children}</div>,
	DialogContent: ({ children }: any) => <div>{children}</div>,
	DialogHeader: ({ children }: any) => <div>{children}</div>,
	DialogTitle: ({ children }: any) => <div>{children}</div>,
}))

describe("Sharing", () => {
	beforeEach(() => {
		;(useExtensionState as any).mockReturnValue({
			isCloudShareEnabled: true,
		})
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe("ShareButton", () => {
		it("should render the share button", () => {
			const mockItem = {
				id: "test-id",
				number: 1,
				ts: Date.now(),
				task: "Test task",
				tokensIn: 100,
				tokensOut: 200,
				totalCost: 0.01,
			}
			render(<ShareButton onClick={() => {}} item={mockItem} />)
			const buttons = screen.getAllByRole("button")
			const shareButton = buttons.find((btn) => btn.querySelector(".codicon-link"))
			expect(shareButton).toBeInTheDocument()
		})

		it("should call onClick when the button is clicked", () => {
			const onClick = vi.fn()
			const mockItem = {
				id: "test-id",
				number: 1,
				ts: Date.now(),
				task: "Test task",
				tokensIn: 100,
				tokensOut: 200,
				totalCost: 0.01,
			}
			render(<ShareButton onClick={onClick} item={mockItem} />)
			const buttons = screen.getAllByRole("button")
			const shareButton = buttons.find((btn) => btn.querySelector(".codicon-link"))
			fireEvent.click(shareButton!)
			expect(onClick).toHaveBeenCalled()
		})
	})

	describe("TaskActions", () => {
		it("should post exportTaskToCloud message when share button is clicked", () => {
			const mockItem = {
				id: "test-id",
				number: 1,
				ts: Date.now(),
				task: "Test task",
				tokensIn: 100,
				tokensOut: 200,
				totalCost: 0.01,
			}
			render(<TaskActions item={mockItem} buttonsDisabled={false} />)
			const buttons = screen.getAllByRole("button")
			const shareButton = buttons.find((btn) => btn.querySelector(".codicon-link"))
			expect(shareButton).toBeDefined()
			fireEvent.click(shareButton!)
			expect(vscode.postMessage).toHaveBeenCalledWith({ type: "exportTaskToCloud", text: undefined })
		})

		it("should post importTaskFromCloudByUrl message when import button is clicked", () => {
			window.prompt = vi.fn().mockReturnValue("test-id")
			render(<TaskActions buttonsDisabled={false} />)
			const importButton = screen.getByLabelText("chat:task.import")
			fireEvent.click(importButton)
			expect(vscode.postMessage).toHaveBeenCalledWith({
				type: "importTaskFromCloudByUrl",
				text: "test-id",
			})
		})

		it("should post importTaskFromCloudByUrl message with url when import button is clicked with a url", () => {
			window.prompt = vi.fn().mockReturnValue("https://example.com/session/test-id")
			render(<TaskActions buttonsDisabled={false} />)
			const importButton = screen.getByLabelText("chat:task.import")
			fireEvent.click(importButton)
			expect(vscode.postMessage).toHaveBeenCalledWith({
				type: "importTaskFromCloudByUrl",
				text: "https://example.com/session/test-id",
			})
		})
	})
})
