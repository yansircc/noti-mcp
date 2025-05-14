import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";

import type { Request } from "express";
import { extractApiKeys, isValidScKey } from "../middleware/auth.js";
import {
	commissionCalculator,
	commissionSchema,
} from "../tools/commission-calculator.js";
import { echo, echoSchema } from "../tools/echo.js";
import { emailSchema, sendEmail } from "../tools/send-email.js";
import {
	sendWechatNotification,
	wechatPushSchema,
} from "../tools/wechat-push.js";

/**
 * Register all tools to the MCP server with proper authentication
 */
export function registerTools(server: McpServer, req: Request): void {
	const { sendKey, scKey } = extractApiKeys(req);

	// Register echo tool
	server.tool(
		"echo",
		"Echoes back the provided message",
		echoSchema.shape,
		async (args: z.infer<typeof echoSchema>) => echo(args),
	);

	// Register send-email tool
	server.tool(
		"send-email",
		"Send an email",
		emailSchema.shape,
		async (args: z.infer<typeof emailSchema>) =>
			sendEmail({ ...args, apiKey: sendKey }),
	);

	// Register send-wechat-notification tool
	server.tool(
		"wechat-message-push",
		"Push a wechat message",
		wechatPushSchema.shape,
		async (args: z.infer<typeof wechatPushSchema>) => {
			if (!scKey || !isValidScKey(scKey)) {
				console.warn(
					"send-wechat-notification tool called without valid scKey",
				);
				return {
					content: [
						{
							type: "text",
							text: "Error: ServerChan API key (scKey) is missing or invalid for this request.",
						},
					],
					isError: true,
				};
			}

			return sendWechatNotification({ ...args, apiKey: scKey });
		},
	);

	// Register commission calculator tool
	server.tool(
		"commission-calculator",
		"Calculate commission, tax and net income based on profit",
		commissionSchema.shape,
		async (args: z.infer<typeof commissionSchema>) =>
			commissionCalculator(args),
	);
}
