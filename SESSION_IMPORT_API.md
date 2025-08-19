# Session Import API Documentation

This document outlines the API endpoints and data schemas required for a backend agent to handle session imports.

## API Endpoints

The backend service should expose the following endpoints to align with the functionality in the VS Code extension.

### 1. Create a new session

- **Endpoint:** `POST /api/sessions`
- **Description:** Creates a new shared session from the provided session data. This is used when a user exports a task to the cloud.
- **Request Body:** `SerializedSession` JSON object (see schema below).
- **Response:**
    - `201 Created`: On success.
    - **Body:** `{ "id": "string", "url": "string" }`
        - `id`: A unique identifier for the created session.
        - `url`: The public-facing URL to share the session.

### 2. Retrieve an existing session

- **Endpoint:** `GET /api/sessions/:id`
- **Description:** Retrieves a shared session by its unique ID. This is used when a user imports a task from a shared link or ID.
- **URL Parameters:**
    - `id`: The unique identifier of the session.
- **Response:**
    - `200 OK`: On success.
    - **Body:** `SerializedSession` JSON object (see schema below).
    - `404 Not Found`: If no session with the given ID exists.

## Data Schema: `SerializedSession`

The `SerializedSession` object is the core data structure for both importing and exporting tasks. The backend agent must validate incoming data against this schema.

```typescript
import { z } from "zod"
import type { ClineMessage, HistoryItem } from "@roo-code/types"

// Base schema for a single message in the chat history
const MessageSchema = z.custom<ClineMessage>()

// Schema for the main task object
const TaskSchema = z.custom<HistoryItem>()

// Schema for the serialized session data that will be exported/imported
export const SerializedSessionSchema = z.object({
	version: z.string(),
	task: TaskSchema,
	messages: z.array(MessageSchema),
})

export type SerializedSession = z.infer<typeof SerializedSessionSchema>
```

### Field Descriptions

- **`version`** (`string`): The version of the serialization format. The current version is `"1.0.0"`.
- **`task`** (`HistoryItem`): The main task object. The structure of `HistoryItem` is defined in the `@roo-code/types` package, but for the backend, it can be treated as a generic JSON object representing the task's metadata (e.g., task ID, title, etc.).
- **`messages`** (`Array<ClineMessage>`): An array of chat messages associated with the task. The structure of `ClineMessage` is also defined in `@roo-code/types` and represents a single message in the conversation history. It can be treated as a generic JSON object by the backend.

The backend's primary responsibility is to store and retrieve the `SerializedSession` object as a whole, without needing to deeply inspect the contents of `task` or `messages`. Validation against the schema is sufficient.
