import { z } from "zod";
import { formatToolResponse } from "../utils/response";

/**
 * Schema for echo tool input
 */
export const echoSchema = z.object({
  message: z.string(),
});

/**
 * Echo tool implementation
 */
export async function echo(args: z.infer<typeof echoSchema>) {
  return formatToolResponse(`Tool echo: ${args.message}`);
} 