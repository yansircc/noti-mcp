import type { NextFunction, Request, Response } from "express";

interface ApiKeys {
  sendKey: string;
  scKey: string;
}

/**
 * Extracts API keys from request headers
 */
export function extractApiKeys(req: Request): ApiKeys {
  return {
    sendKey: req.headers["mcp-send-key"] as string | undefined || "",
    scKey: req.headers["mcp-sc-key"] as string | undefined || ""
  };
}

/**
 * Validates if the send key is valid
 */
export function isValidSendKey(key: string): boolean {
  return key.startsWith("sk_");
}

/**
 * Validates if the ServerChan key is valid
 */
export function isValidScKey(key: string): boolean {
  return key.startsWith("SC");
}

/**
 * Authentication middleware for MCP requests
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { sendKey, scKey } = extractApiKeys(req);

  if (!sendKey || !isValidSendKey(sendKey)) {
    console.warn(`Unauthorized attempt with key: ${sendKey || "MISSING"}`);
    res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Unauthorized: Invalid or missing send API key",
      },
      id: req.body?.id ?? null,
    });
    return;
  }

  if (!scKey || !isValidScKey(scKey)) {
    console.warn(`Unauthorized attempt with SC key: ${scKey || "MISSING"}`);
    res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Unauthorized: Invalid or missing ServerChan API key",
      },
      id: req.body?.id ?? null,
    });
    return;
  }

  next();
} 