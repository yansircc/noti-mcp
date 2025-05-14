import { scSend } from "serverchan-sdk";
import { z } from "zod";
import { formatToolResponse } from "../utils/response.js";

/**
 * Schema for WeChat notification parameters
 */
export const wechatPushSchema = z.object({
	title: z.string(),
	description: z.string(),
});

/**
 * Interface for WeChat notification arguments including API key
 */
interface WechatPushArgs extends z.infer<typeof wechatPushSchema> {
	apiKey: string;
}

/**
 * Schema for ServerChan API response
 */
export const sendWechatNotificationResponseSchema = z.object({
	code: z.number(),
	message: z.string(),
	data: z.any().optional(),
});

/**
 * Send a WeChat notification using ServerChan
 */
export async function sendWechatNotification({
	title,
	description,
	apiKey,
}: WechatPushArgs) {
	try {
		const result = await scSend(apiKey, title, description);
		const response = sendWechatNotificationResponseSchema.safeParse(result);

		if (!response.success) {
			console.error("Invalid ServerChan API response format:", result);
			return formatToolResponse(
				"Invalid response format from ServerChan API",
				true,
			);
		}

		const { data } = response;

		if (data.code === 0) {
			console.log(
				`ServerChan notification successful for key starting with ${apiKey.substring(0, 4)}...`,
			);
			return formatToolResponse(
				`WeChat notification sent successfully. Message: ${data.message}`,
			);
		}

		console.error(
			`ServerChan notification failed for key starting with ${apiKey.substring(0, 4)}... Code: ${data.code}, Message: ${data.message}`,
		);
		return formatToolResponse(
			`Failed to send WeChat notification. Error: ${data.message} (Code: ${data.code})`,
			true,
		);
	} catch (error) {
		console.error("Error sending wechat notification:", error);
		return formatToolResponse(
			`Error sending wechat notification: ${error instanceof Error ? error.message : String(error)}`,
			true,
		);
	}
}
