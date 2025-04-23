# MCP Bun Server with Email Support

This project provides an MCP (Model Context Protocol) server implementation with
Bun that includes email notification capabilities.

## Features

- MCP server with streamable HTTP transport
- Email notification tool
- BMI calculation tool (example)
- Two implementation options:
  - Stateless mode (main.ts)
  - Session-based mode (session-main.ts)

## Prerequisites

- Bun installed
- Plunk API key (for email functionality)

## Installation

```bash
# Clone the repository
git clone [repository-url]
cd [repository-name]

# Install dependencies
bun install
```

## Configuration

Create a `.env` file in the project root with the following variables:

```
PLUNK_API_KEY=your_plunk_api_key
EMAIL_API_KEY=your_custom_key_for_authentication
```

## Running the Server

### Stateless Mode

```bash
bun run src/main.ts
```

### Session-Based Mode

```bash
bun run src/session-main.ts
```

The server will start on port 3000 by default. You can change this by setting
the `PORT` environment variable.

## Using the Email Tool

### Stateless Implementation

在无状态实现中，身份验证通过请求头中的API密钥进行处理。

示例客户端代码:

```typescript
// 示例客户端代码调用邮件工具
const response = await fetch("http://localhost:3000/mcp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "mcp-send-key": "your_api_key_here", // 来自 EMAIL_API_KEY 环境变量
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "1",
    method: "send-email",
    params: {
      to: "recipient@example.com",
      subject: "测试邮件",
      body: "这是通过MCP发送的测试邮件",
    },
  }),
});

const result = await response.json();
console.log(result);
```

### Session-Based Implementation

In the session-based implementation, you need to provide an API key in the
headers and manage the session.

```typescript
// Initialize session
const initResponse = await fetch("http://localhost:3000/mcp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "mcp-send-key": "your_api_key_here", // From EMAIL_API_KEY env var
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "1",
    method: "initialize",
    params: {},
  }),
});

const initResult = await initResponse.json();
const sessionId = initResponse.headers.get("mcp-session-id");

// Use session to send email
const emailResponse = await fetch("http://localhost:3000/mcp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "mcp-session-id": sessionId,
    "mcp-send-key": "your_api_key_here",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "2",
    method: "send-email",
    params: {
      to: "recipient@example.com",
      subject: "Test Email",
      body: "This is a test email sent via MCP",
    },
  }),
});

const emailResult = await emailResponse.json();
console.log(emailResult);
```

## Security Considerations

- The `EMAIL_API_KEY` environment variable is used for authentication in both
  implementations
- In the session-based implementation, this key must be provided in the
  `mcp-send-key` header
- Set up proper CORS policies in production environments
- Consider implementing rate limiting for email sending

## License

[Your License]
