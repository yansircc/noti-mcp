import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Server configuration
 */
export const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

/**
 * Creates a base MCP server instance without static tools
 */
export function createBaseServer(): McpServer {
	return new McpServer({
		name: "notification-server",
		version: "1.0.0",
		capabilities: {
			streamable: true,
		},
	});
}
