# Session Import API

This document outlines the API endpoint and schema for importing a shared session.

## Endpoint

- **POST** `/api/sessions`

    This endpoint retrieves a shared session by taking the `id` and `username` in the request body. Although `POST` is typically used for creating resources, it is used here to allow for sending a request body, which is necessary for the import operation.

## Headers

- `Syntx-Api-Key`: The user's API key for authentication.
- `Content-Type`: `application/json`

## Request Body

The `POST` request must include a JSON body with the following fields:

| Field      | Type     | Description                           |
| :--------- | :------- | :------------------------------------ |
| `id`       | `string` | The ID of the session to retrieve.    |
| `username` | `string` | The username of the session's author. |

## Response Schema

The server should respond with a JSON object containing the session data. The response should follow the `SerializedSession` schema defined in `src/services/session/schema.ts`.

### `SerializedSession`

| Field      | Type                              | Description                           |
| :--------- | :-------------------------------- | :------------------------------------ |
| `version`  | `string`                          | The version of the session schema.    |
| `task`     | [`HistoryItem`](#historyitem)     | The task associated with the session. |
| `messages` | [`ClineMessage[]`](#clinemessage) | An array of messages in the session.  |

### `HistoryItem`

| Field       | Type     | Description                  |
| :---------- | :------- | :--------------------------- |
| `id`        | `string` | The unique ID of the task.   |
| `task`      | `string` | The description of the task. |
| `number`    | `number` | The task number.             |
| `ts`        | `number` | The timestamp of the task.   |
| `tokensIn`  | `number` | The number of input tokens.  |
| `tokensOut` | `number` | The number of output tokens. |
| `totalCost` | `number` | The total cost of the task.  |

### `ClineMessage`

The `ClineMessage` object can be one of several types, each with its own structure. Refer to the `@roo-code/types` package for detailed definitions.

## How Import Works

The VS Code extension supports multiple share link formats:

### Format 1: Username/Session ID (New Format)

When a user pastes a share link like `viragtiwari/HzKozOxIxl4dO0YijPu0q`, the VS Code extension:

1. Extracts the session ID (`HzKozOxIxl4dO0YijPu0q`) from the username/sessionId format
2. Uses the configured base URL from VS Code settings (`syntx.sessionSharing.baseUrl`)
3. Makes an API call to `{baseUrl}/api/sessions/{id}` to retrieve the session data

### Format 2: Full URL

When a user pastes a share URL like `username/HzKozOxIxl4dO0YijPu0q`, the VS Code extension:

1. Extracts the session ID (`HzKozOxIxl4dO0YijPu0q`) from the code
2. Extracts the name (`username`) from the code
3. Makes an API call to `{baseUrl}/api/sessions` to retrieve the session data

The VS Code extension will extract the session ID from the share link and call the appropriate API endpoint to retrieve the session data.
