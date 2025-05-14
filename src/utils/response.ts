import type { Response } from "express";

/**
 * Standard MCP error response structure
 */
interface McpErrorResponse {
  jsonrpc: string;
  error: {
    code: number;
    message: string;
  };
  id: string | number | null;
}

/**
 * Error codes for MCP responses
 */
export enum ErrorCode {
  UNAUTHORIZED = -32001,
  METHOD_NOT_ALLOWED = -32000,
  INTERNAL_ERROR = -32603,
}

/**
 * Send a JSON-RPC error response
 */
export function sendErrorResponse(
  res: Response,
  statusCode: number,
  errorCode: ErrorCode,
  message: string,
  id: string | number | null = null
): void {
  const errorResponse: McpErrorResponse = {
    jsonrpc: "2.0",
    error: {
      code: errorCode,
      message,
    },
    id,
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Format tool response text
 */
export function formatToolResponse(text: string, isError = false) {
  return {
    content: [{ type: "text" as const, text }],
    isError,
  };
} 