# SyntX: Your AI-Powered Development Assistant

## 1. Introduction to SyntX

SyntX is an advanced AI-powered development assistant designed to help you with a wide range of software development tasks. Unlike traditional AI assistants, SyntX can directly interact with your codebase, execute commands, and provide contextual assistance based on your project's structure and requirements.

SyntX combines the power of large language models with direct access to your development environment, enabling it to:

- Read, write, and modify files in your project
- Execute commands on your system
- Analyze code and suggest improvements
- Help with debugging and troubleshooting
- Assist with project planning and architecture
- Provide information and answer questions about programming concepts

## 2. Getting Started with SyntX

### Initiating a Conversation

To start using SyntX, simply open the SyntX panel in your development environment and type your request or question. SyntX understands natural language, so you can communicate with it as you would with a human colleague.

### Best Practices for Effective Communication

- **Be specific**: The more specific your request, the better SyntX can assist you.
- **Provide context**: When asking about code, include relevant file names or code snippets.
- **Break down complex tasks**: For complex tasks, break them down into smaller, manageable steps.
- **Use appropriate modes**: Select the mode that best fits your current task (more on modes below).

### Understanding the Interface

SyntX operates in a chat-based interface where you can:

- Type messages to communicate your needs
- View SyntX's responses and actions
- See the results of commands executed by SyntX
- Review file changes made by SyntX

## 3. SyntX Modes

![SyntX Modes](https://raw.githubusercontent.com/viragtiwari/image_for_markdown/refs/heads/main/Screenshot%202025-06-06%20113601.png)

SyntX offers several specialized modes, each optimized for different types of tasks:

### Code Mode

**Purpose**: Writing, modifying, and analyzing code.

**When to use**: When you need to implement features, fix bugs, or make code changes.

**Example tasks**:

- "Create a React component for a user profile page"
- "Fix the bug in the authentication service"
- "Refactor this function to improve performance"

### Planner Mode

**Purpose**: Project planning, system design, and architecture decisions.

**When to use**: When you're planning new features, designing systems, or making architectural decisions.

**Example tasks**:

- "Design a database schema for a blog application"
- "Create a plan for implementing a new authentication system"
- "Help me architect a microservices solution for my e-commerce platform"

### Chat Mode

**Purpose**: Answering questions and providing information.

**When to use**: When you need information about programming concepts, libraries, or best practices.

**Example tasks**:

- "Explain how React hooks work"
- "What's the difference between REST and GraphQL?"
- "What are the best practices for securing a Node.js application?"

### Design Engineer Mode

**Purpose**: Specialized assistance for VSCode Extension development.

**When to use**: When working specifically on VSCode extensions.

**Example tasks**:

- "Create a VSCode extension for syntax highlighting"
- "Help me implement a custom view in my VSCode extension"
- "Debug the activation events in my extension"

### Debug Mode

**Purpose**: Systematic problem diagnosis and resolution.

**When to use**: When you're stuck with bugs or errors that need careful investigation.

**Example tasks**:

- "Help me debug this memory leak"
- "Diagnose why my API calls are failing"
- "Find out why my application crashes when processing large files"

### Switching Between Modes

You can switch between modes by using the mode selector in the SyntX interface or by asking SyntX to switch modes for you. For example:

- "Switch to Code mode to implement this feature"
- "I need help with architecture planning, can you switch to Architect mode?"

## 4. SyntX Tools and Capabilities

![SyntX Tools and Capabilities](https://raw.githubusercontent.com/viragtiwari/image_for_markdown/refs/heads/main/Screenshot%202025-06-08%20234934.png)
SyntX has access to a variety of tools that allow it to interact with your development environment:

### File Operations

#### Reading Files

SyntX can read files to understand your codebase:

```
User: Can you explain how the authentication system works in my project?

SyntX: I'll take a look at your authentication files to understand the system.
[SyntX reads relevant authentication files]
Based on the files I've examined, your authentication system uses JWT tokens with a 24-hour expiration...
```

#### Writing and Modifying Files

SyntX can create new files or modify existing ones:

```
User: Create a new React component for a user profile page.

SyntX: I'll create a new component for the user profile page.
[SyntX writes a new file: UserProfile.jsx]
I've created the UserProfile component with the following features...
```

#### Searching Files

SyntX can search across your codebase to find relevant information:

```
User: Find all usages of the "authenticateUser" function in the project.

SyntX: Searching for all usages of "authenticateUser"...
[SyntX searches files]
I found 5 usages of the "authenticateUser" function across 3 files...
```

### Code Analysis and Manipulation

SyntX can analyze your code to identify patterns, suggest improvements, and make changes:

```
User: Can you refactor this function to be more efficient?

SyntX: I'll analyze the function and suggest improvements.
[SyntX analyzes the code]
I've identified several areas for improvement:
1. The nested loops can be simplified
2. You're recalculating the same value multiple times
Here's my suggested refactoring...
```

### Command Execution

SyntX can execute commands in your terminal:

```
User: Run the tests for the authentication module.

SyntX: Running tests for the authentication module...
[SyntX executes: npm test -- --testPathPattern=auth]
The tests have completed with 15 passed and 2 failed...
```

### MCP Servers and Extensions

### Single click MCP install and Marketplace

![Single click MCP install and Marketplace](https://raw.githubusercontent.com/viragtiwari/image_for_markdown/refs/heads/main/Screenshot%202025-06-09%20000145.png)
SyntX can be easily extended with Model Context Protocol (MCP) servers, providing additional tools and capabilities with just a single click:

```
User: Can you add a weather tool so I can check the weather?

SyntX: I'll create an MCP server for weather data.
[SyntX creates and configures a weather MCP server]
I've added a weather tool. You can now ask me about the weather in any city.
```

### Visual Capabilities

![Visual Capabilities](https://raw.githubusercontent.com/viragtiwari/image_for_markdown/refs/heads/main/Screenshot%202025-06-08%20235759.png)

SyntX can analyze images and visual content:

```
User: [Uploads a screenshot of an error message]
What's causing this error?

SyntX: Based on the error message in the screenshot, it looks like you're trying to access a property of an undefined object...
```

## 5. Common Use Cases

### Software Development Tasks

#### Implementing Features

```
User: I need to implement a login form with email and password fields, validation, and submission handling.

SyntX: I'll help you implement the login form. Let me create the necessary files...
```

#### Code Reviews and Improvements

```
User: Can you review this function and suggest improvements?

SyntX: I'll review the function for you.
[SyntX analyzes the code]
Here are my suggestions for improvement:
1. Add input validation to prevent potential errors
2. Use destructuring for cleaner parameter handling
3. Consider using async/await instead of promises with then/catch
```

### Debugging and Troubleshooting

```
User: My application crashes when I try to load data from the API. Here's the error message...

SyntX: Let me help you debug this issue.
[SyntX analyzes the error and relevant code]
The error occurs because you're trying to access properties of the response before checking if the response exists. Let's modify the code to add proper error handling...
```

### Project Planning and Architecture

```
User: I'm building a blog application and need help designing the database schema.

SyntX: I'll help you design a database schema for your blog application.
[SyntX creates a database schema diagram]
Here's a proposed schema with tables for users, posts, comments, categories, and tags...
```

### Learning and Information Retrieval

```
User: Explain how React's useEffect hook works and when to use it.

SyntX: The useEffect hook in React is used for handling side effects in functional components...
[SyntX provides a detailed explanation with examples]
```

## 6. Advanced Techniques

### Combining Multiple Tools for Complex Tasks

SyntX can combine multiple tools to accomplish complex tasks:

```
User: I need to add a new API endpoint for user registration, including the route, controller, validation, and tests.

SyntX: I'll help you implement the complete user registration endpoint.
[SyntX reads existing code to understand the project structure]
[SyntX creates new files for the route and controller]
[SyntX modifies existing files to register the new route]
[SyntX creates validation middleware]
[SyntX writes tests for the new endpoint]
I've implemented the complete user registration endpoint...
```

### Creating Custom Modes

You can create custom modes tailored to specific projects or workflows:

```
User: Create a custom mode for working with GraphQL.

SyntX: I'll create a custom GraphQL mode for you.
[SyntX creates a custom mode configuration]
I've created a GraphQL mode that specializes in schema design, resolver implementation, and query optimization...
```

### Create custom MCP servers with SyntX

You can extend SyntX's capabilities by creating custom MCP servers:

```
User: Can you create an MCP server that integrates with Jira?

SyntX: I'll create an MCP server for Jira integration.
[SyntX creates and configures a Jira MCP server]
I've added Jira integration. You can now ask me to create, update, or query Jira issues...
```

### Tips for Optimal Results

- **Start with a clear goal**: Define what you want to achieve before asking SyntX for help.
- **Provide relevant context**: Share necessary background information and constraints.
- **Review and iterate**: Check SyntX's output and provide feedback for improvements.
- **Use the right mode**: Select the mode that best matches your current task.
- **Break down complex tasks**: For complex projects, work with SyntX in manageable chunks.

## 7. Troubleshooting and FAQs

### Common Issues and Solutions

#### SyntX doesn't understand my request

**Solution**: Try rephrasing your request with more specific details or breaking it down into smaller steps.

#### SyntX generates incorrect code

**Solution**: Review the code and provide specific feedback about what's wrong. SyntX can learn from your feedback and make corrections.

#### SyntX can't access certain files

**Solution**: Ensure that the files are within the current working directory or provide the correct file paths.

### Limitations to Be Aware Of

- SyntX operates within the context it has access to. It may not be aware of all aspects of your project unless you provide that information.
- Complex architectural decisions may require additional guidance and validation from you.
- SyntX's ability to execute commands is limited by the permissions of your user account.

### How to Provide Effective Feedback

When providing feedback to SyntX:

- Be specific about what worked and what didn't
- Explain why certain approaches are preferred in your project
- Share examples of the desired outcome when possible

## 8. SyntX Rules System

SyntX features a powerful rules system that allows you to customize how the AI behaves in your projects. Rules provide context about your coding standards, project architecture, and specific requirements, ensuring SyntX provides more relevant and consistent assistance.

### Rule Types and Priority Order

SyntX loads rules in the following priority order (highest to lowest):

1. **`.syntx/rules/` directory files** - Organized rules for complex projects
2. **`syntx.md`** - Project guidance and documentation
3. **`.syntxrules`** - Simple rule file for quick setup

### When to Use Each Rule Type

#### 1. `.syntx/rules/` Directory - For Complex Projects

**Best for:**

- Large teams with multiple rule categories
- Projects requiring organized rule structure
- Need for modular rule management

**Example structure:**

```
.syntx/rules/
├── coding-standards.md
├── api-guidelines.md
├── testing-requirements.md
└── deployment-rules.md
```

**Example content (`coding-standards.md`):**

```markdown
# Coding Standards

## TypeScript Usage

- Always use TypeScript for new files
- Add strict type annotations for public APIs

## Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and components
```

#### 2. `syntx.md` - For Project Documentation

**Best for:**

- Comprehensive project context
- Architecture explanations
- Rich markdown formatting needs
- Team onboarding documentation

**Example content:**

```markdown
# Project Architecture

This is a Next.js e-commerce platform built with:

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM

## Key Patterns

### Component Structure

All React components should use the following structure:

- Functional components with TypeScript
- Custom hooks for business logic
- Styled with Tailwind CSS

### API Integration

- All API calls go through `src/lib/api.ts`
- Use React Query for data fetching
- Handle errors with the global error boundary

## Database Schema

[Include important schema information here]
```

#### 3. `.syntxrules` - For Simple Projects

**Best for:**

- Small to medium projects
- Quick setup without directory structure
- Simple, direct instructions

**Example content:**

```
Use TypeScript everywhere
Add JSDoc to all public functions
Run prettier before commits
Use the custom Button component from /components/ui/
All API calls should use the fetchApi utility from /lib/api.ts
Write tests for new features using Jest
Maintain 80%+ test coverage
```

### Mode-Specific Rules

You can create rules that only apply when using specific SyntX modes:

#### File-based Mode Rules

- `.syntxrules-architect` - Rules for Architect mode
- `.syntxrules-debug` - Rules for Debug mode
- `.syntxrules-code` - Rules for Code mode

#### Directory-based Mode Rules

```
.syntx/rules-architect/
├── system-design.md
└── architecture-patterns.md

.syntx/rules-debug/
├── debugging-workflow.md
└── troubleshooting-steps.md
```

**Example mode-specific rule (`.syntxrules-architect`):**

```
Focus on system design and architecture decisions
Consider scalability and maintainability in all recommendations
Suggest design patterns appropriate for the project scale
Always include diagrams or visual representations when helpful
```

### Setting Up Rules for Your Project

#### Quick Setup (Recommended for most projects)

1. **Create a `.syntxrules` file in your project root:**

```bash
# Copy the sample file
cp .syntxrules.sample .syntxrules

# Edit to match your project
code .syntxrules
```

2. **Add your project-specific rules:**

```
# Your coding standards
Use TypeScript for all new files
Follow the existing component structure in src/components/

# Your project patterns
Use the custom hooks from src/hooks/
API calls should go through src/services/api.ts

# Your testing requirements
Write unit tests for all utilities
Integration tests for API endpoints
```

#### Advanced Setup (For complex projects)

1. **Create organized rule directories:**

```bash
mkdir -p .syntx/rules
```

2. **Create category-specific rule files:**

```bash
# Coding standards
echo "# Coding Standards
Use TypeScript everywhere
Follow ESLint configuration" > .syntx/rules/coding-standards.md

# API guidelines
echo "# API Guidelines
Use REST conventions
Validate all inputs" > .syntx/rules/api-guidelines.md
```

3. **Add comprehensive project guidance:**

```bash
echo "# Project Architecture
This project uses microservices..." > syntx.md
```

### Rule Best Practices

#### Writing Effective Rules

**Be Specific:**

```
❌ Use good practices
✅ Use async/await instead of .then() for promises
```

**Provide Context:**

```
❌ Use the Button component
✅ Use the custom Button component from src/components/ui/ instead of creating new buttons
```

**Include Examples:**

```
Add JSDoc comments for all public functions:
/**
 * Calculates the total price including tax
 * @param price - Base price before tax
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price including tax
 */
```

#### Organizing Rules

**For Small Projects:**

- Use `.syntxrules` for everything
- Keep rules concise and actionable

**For Medium Projects:**

- Use `.syntxrules` for core standards
- Use `syntx.md` for architecture context

**For Large Projects:**

- Use `.syntx/rules/` directory structure
- Separate concerns (coding, testing, deployment)
- Use `syntx.md` for comprehensive documentation

### Common Rule Categories

#### Coding Standards

```
Use TypeScript for all new files
Follow consistent naming conventions
Use ESLint and Prettier configurations
Add JSDoc comments for public APIs
```

#### Project Architecture

```
Follow the existing folder structure
Use React functional components with hooks
Implement error boundaries for component error handling
Use the established state management pattern
```

#### Testing Requirements

```
Write unit tests for all utilities using Jest
Maintain test coverage above 80%
Use integration tests for API endpoints
Run tests before committing changes
```

#### Security Guidelines

```
Never commit secrets or API keys
Sanitize all user inputs
Use environment variables for configuration
Validate data at API boundaries
```

### Troubleshooting Rules

#### Rules Not Being Applied

1. **Check file location** - Rules must be in project root
2. **Verify file naming** - Use exact names (`.syntxrules`, not `.syntx-rules`)
3. **Check file permissions** - Ensure SyntX can read the files

#### Rules Conflicting

- Higher priority rules override lower priority ones
- Mode-specific rules take precedence over general rules
- Use the priority order to resolve conflicts

#### Testing Your Rules

Ask SyntX to explain how it would approach a task:

```
User: "How should I create a new React component for this project?"

SyntX: "Based on your project rules, I'll create a TypeScript functional component using your established patterns..."
```

## Conclusion

SyntX is a powerful AI assistant designed to enhance your development workflow. By understanding its capabilities, modes, and rules system, you can leverage SyntX to increase your productivity, improve code quality, and tackle complex development challenges.

The rules system ensures that SyntX understands your project's specific requirements and coding standards, providing more relevant and consistent assistance. Start with simple `.syntxrules` files and gradually expand to more sophisticated rule structures as your projects grow in complexity.

Remember that SyntX is continuously learning and improving based on your interactions, so don't hesitate to provide feedback and explore new ways to incorporate it into your development process.
