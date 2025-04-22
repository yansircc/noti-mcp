# Simple Bun API Server

A lightweight API server built with Bun.

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Run the API server:

```bash
bun api
```

The server will start on http://localhost:3001

## Available Endpoints

### GET /

Returns a simple "Hello World" text response.

Example:

```bash
curl http://localhost:3001/
```

Response:

```
Hello World
```

### GET /api/hello

Returns a JSON response with a "Hello World" message and timestamp.

Example:

```bash
curl http://localhost:3001/api/hello
```

Response:

```json
{
  "message": "Hello World",
  "timestamp": "2023-12-12T12:00:00.000Z"
}
```

## Development

The API server uses Bun's built-in HTTP server capabilities. To modify the
server, edit the `src/api.ts` file.

You can add more routes and functionality by modifying the request handler in
the `fetch` function.
