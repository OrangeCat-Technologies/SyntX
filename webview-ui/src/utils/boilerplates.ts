export interface Boilerplate {
	id: string
	title: string
	description: string
	initialInput: string
}

export const starterBoilerplates: Boilerplate[] = [
	{
		id: "ping-pong-game",
		title: "Create Ping Pong Game",
		description: "Generate a Ping Pong game using HTML, CSS, and JavaScript.",
		initialInput:
			"Create a fully functional Ping Pong game using HTML for structure, CSS for styling, and JavaScript for game logic. The game should include two paddles, a ball, a scoring system, and basic AI for one of the paddles if playing against the computer, or allow two human players.",
	},
	{
		id: "portfolio-website",
		title: "Build a Portfolio Website",
		description: "Create a beautiful portfolio website, asking for necessary details.",
		initialInput:
			"I want to create a genuinely beautiful and modern portfolio website using HTML, CSS, and JavaScript. Please start by asking me for the necessary details such as my name, professional title, a brief bio, list of skills, project details (name, description, technologies used, link), and contact information. Then, generate the code for the website.",
	},
	{
		id: "cli-quiz-game",
		title: "Command-Line Quiz Game",
		description:
			"Develop a basic quiz game that asks users multiple-choice questions and keeps track of their score.",
		initialInput:
			"I want to make a simple command-line quiz game in Python. It should have a predefined set of questions, each with multiple choice answers. The game should present a question, get the user's answer, tell them if they're correct, and keep score. Let's start by defining the data structure for a few questions and answers.",
	},
]
