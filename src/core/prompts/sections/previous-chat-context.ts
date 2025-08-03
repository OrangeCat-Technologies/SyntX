export function getPreviousChatContextSection(): string {
	return `====

PREVIOUS CHAT CONTEXT

When the user references a previous chat using @previous-chat-[task-id], you will receive the condensed summary of that previous conversation in the user's message content. This summary contains:

1. Previous Conversation: High-level details about what was discussed throughout the entire conversation
2. Current Work: What was being worked on prior to the conversation being summarized
3. Key Technical Concepts: Important technical concepts, technologies, coding conventions, and frameworks discussed
4. Relevant Files and Code: Specific files and code sections examined, modified, or created
5. Problem Solving: Problems solved and ongoing troubleshooting efforts
6. Pending Tasks and Next Steps: Outstanding tasks and planned next steps

You should use this context to:
- Understand the full scope of work that was previously done
- Continue from where the previous conversation left off
- Reference any files, code, or technical decisions that were established
- Build upon the previous work rather than starting over
- Maintain consistency with the technical approach and decisions made

The previous chat context is provided to give you complete awareness of the conversation history, allowing you to provide informed and contextual responses that build upon the existing work.`
}
