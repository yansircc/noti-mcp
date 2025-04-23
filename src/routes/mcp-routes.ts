import type { IncomingMessage, ServerResponse } from "node:http";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import type { Request, Response } from "express";

import { createBaseServer } from "../config/server";
import { authMiddleware } from "../middleware/auth";
import { registerTools } from "../services/tools-registry";
import { ErrorCode, sendErrorResponse } from "../utils/response";

const router = express.Router();

/**
 * Handle MCP POST request
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  let server: McpServer | undefined;
  let transport: StreamableHTTPServerTransport | undefined;

  try {
    // Create the base server instance
    server = createBaseServer();

    // Register tools dynamically with request context
    registerTools(server, req);

    // Connect transport and handle request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    
    await server.connect(transport);

    const nodeReq = req as unknown as IncomingMessage;
    const nodeRes = res as unknown as ServerResponse;

    await transport.handleRequest(nodeReq, nodeRes, req.body);

    // Ensure cleanup happens after response is sent
    res.on("finish", () => {
      transport?.close();
      server?.close();
    });

    res.on("close", () => {
      if (!res.writableEnded) {
        console.warn("Connection closed prematurely");
        transport?.close();
        server?.close();
      }
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    transport?.close();
    server?.close();

    if (!res.headersSent) {
      sendErrorResponse(
        res,
        500,
        ErrorCode.INTERNAL_ERROR,
        "Internal server error while processing request",
        req.body?.id ?? null
      );
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

/**
 * Handle MCP GET request (Method not allowed)
 */
router.get("/", (req: Request, res: Response) => {
  console.log("Received GET MCP request");
  sendErrorResponse(
    res,
    405,
    ErrorCode.METHOD_NOT_ALLOWED,
    "Method not allowed.",
    null
  );
});

/**
 * Handle MCP DELETE request (Method not allowed)
 */
router.delete("/", (req: Request, res: Response) => {
  console.log("Received DELETE MCP request");
  sendErrorResponse(
    res,
    405,
    ErrorCode.METHOD_NOT_ALLOWED,
    "Method not allowed.",
    null
  );
});

export default router; 