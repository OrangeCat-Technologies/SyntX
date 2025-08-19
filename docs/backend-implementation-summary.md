# Backend Implementation Summary

This document provides a quick reference for implementing the session sharing backend API.

## Quick Start Checklist

### ✅ Required API Endpoints

1. **POST /api/sessions** - Create session (requires API key)
2. **GET /api/public/sessions/{id}** - Get session (public access, optional API key)
3. **GET /api/sessions/{id}** - Get session (authenticated access)
4. **GET /api/health** - Health check

### ✅ Authentication Method

- **Header**: `Syntx-Api-Key: lagrange_key_abc123`
- **Integration**: Validate with existing Lagrange UserDB
- **Public Access**: Allow GET requests without authentication

### ✅ Database Schema (Essential Fields)

```json
{
	"_id": "session_abc123",
	"version": "1.0.0",
	"task": {
		/* HistoryItem object */
	},
	"messages": [
		/* Array of ClineMessage objects */
	],
	"title": "Optional session title",
	"userId": "user_123",
	"isPublic": true,
	"createdAt": "2023-12-20T12:00:00Z",
	"expiresAt": null,
	"viewCount": 0
}
```

### ✅ CORS Configuration

```javascript
// Allow VS Code extension and web interface
const allowedOrigins = ["vscode-webview://*", "https://syntx.dev", "https://*.syntx.dev"]
```

## Critical Implementation Notes

### 🔐 Authentication Flow

1. VS Code extension sends `Syntx-Api-Key` header
2. Backend validates key with Lagrange UserDB service
3. Extract user ID from validated key
4. Use user ID for ownership checks

### 🔄 URL Format Support

The VS Code extension will send these URL formats:

- Share URLs: `https://syntx.dev/session/abc123`
- API URLs: `https://syntx.dev/api/sessions/abc123`
- Session IDs: `abc123`

Your API should accept the session ID directly in the path parameter.

### 📊 Error Responses

```json
// 404 Not Found
{
  "error": "Session not found",
  "code": "SESSION_NOT_FOUND"
}

// 401 Unauthorized
{
  "error": "Valid API key required",
  "code": "INVALID_API_KEY"
}

// 403 Forbidden
{
  "error": "Session is private",
  "code": "ACCESS_DENIED"
}
```

## Testing Commands

```bash
# Create session
curl -X POST "http://localhost:8000/api/sessions" \
  -H "Content-Type: application/json" \
  -H "Syntx-Api-Key: lagrange_key_test" \
  -d '{"version":"1.0.0","task":{},"messages":[]}'

# Get public session
curl -X GET "http://localhost:8000/api/public/sessions/abc123"

# Get authenticated session
curl -X GET "http://localhost:8000/api/sessions/abc123" \
  -H "Syntx-Api-Key: lagrange_key_test"
```

## Deployment Checklist

- [ ] Database indexes created
- [ ] HTTPS enforced
- [ ] CORS configured for VS Code and web interface
- [ ] Rate limiting implemented
- [ ] Lagrange UserDB integration tested
- [ ] Error logging configured
- [ ] Health check endpoint working

## VS Code Extension Compatibility

The VS Code extension expects:

1. **POST** response format:

```json
{
	"id": "session_id",
	"url": "https://syntx.dev/session/session_id"
}
```

2. **GET** response format:

```json
{
	"version": "1.0.0",
	"task": {},
	"messages": [],
	"id": "session_id"
}
```

3. **Error handling**: Standard HTTP status codes with JSON error messages

## Security Requirements

1. ✅ Validate all input data
2. ✅ Sanitize message content
3. ✅ Rate limit by API key
4. ✅ Check session expiration
5. ✅ Respect public/private settings

The VS Code extension implementation is complete and ready to work with any backend that follows this specification.
