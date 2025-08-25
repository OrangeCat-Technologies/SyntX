export interface Boilerplate {
	id: string
	title: string
	description: string
	emoticon: string
	initialInput: string
}

export const starterBoilerplates: Boilerplate[] = [
	// {
	// 	id: "ping-pong-game",
	// 	title: "Create Ping Pong Game",
	// 	description: "Generate a Ping Pong game using HTML, CSS, and JavaScript.",
	// 	emoticon : "",
	// 	initialInput:
	// 		"Create a fully functional Ping Pong game using HTML for structure, CSS for styling, and JavaScript for game logic. The game should include two paddles, a ball, a scoring system, and basic AI for one of the paddles if playing against the computer, or allow two human players.",
	// },
	{
		id: "portfolio-website",
		title: "Build a Portfolio Website",
		description: "Create a beautiful portfolio website, asking for necessary details.",
		emoticon: "🎓",
		initialInput:
			"I want to create a genuinely beautiful and modern portfolio website using HTML, CSS, and JavaScript. Please start by asking me for the necessary details such as my name, professional title, a brief bio, list of skills, project details (name, description, technologies used, link), and contact information. Then, generate the code for the website.",
	},
	{
		id: "calculator-app",
		title: "Build a Calculator",
		description: "Create a simple calculator that performs basic arithmetic operations.",
		emoticon: "🧮",
		initialInput:
			"Help me build a basic calculator using HTML, CSS, and JavaScript. It should support addition, subtraction, multiplication, and division. I want a clean layout with buttons for numbers and operators, and an area to display the result.",
	},
	{
		id: "todo-localstorage",
		title: "To-Do List with Local Storage",
		description: "Create a to-do list app that saves tasks in the browser.",
		emoticon: "🗒️",
		initialInput:
			"Create a to-do list app using HTML, CSS, and JavaScript. It should allow users to add, delete, and mark tasks as completed. All tasks should persist using local storage. Keep the UI clean and easy to use.",
	},
]
