import { z } from "zod";
import { formatToolResponse } from "../utils/response";

/**
 * Schema for email sending parameters
 */
export const emailSchema = z.object({
	to: z.string().email("Must be a valid email address"),
	subject: z.string().min(1, "Subject cannot be empty"),
	body: z.string().min(1, "Email body cannot be empty"),
});

/**
 * Interface for email sending arguments including API key
 */
interface SendEmailArgs extends z.infer<typeof emailSchema> {
	apiKey: string;
}

/**
 * Send an email using Plunk API
 */
export async function sendEmail({ to, subject, body, apiKey }: SendEmailArgs) {
	console.log(
		`Sending email triggered by API key starting with: ${apiKey.substring(0, 4)}...`,
	);

	try {
		if (!apiKey) {
			console.error("Error: API key is not provided");
			return formatToolResponse("Missing API key for email service", true);
		}

		const response = await fetch("https://api.useplunk.com/v1/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				to,
				subject,
				body,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(
				`Plunk API error for key ${apiKey.substring(0, 4)}...: ${response.status} ${response.statusText} - ${errorText}`,
			);
			return formatToolResponse(
				`Failed to send email: ${response.statusText}`,
				true,
			);
		}

		console.log(
			`Email successfully sent for key ${apiKey.substring(0, 4)}... to ${to}`,
		);
		return formatToolResponse("Email sent successfully");
	} catch (error) {
		console.error(
			`Error sending email for key ${apiKey.substring(0, 4)}...:`,
			error,
		);
		return formatToolResponse(
			`An error occurred during email sending: ${String(error)}`,
			true,
		);
	}
}

// Remove or comment out the static tool export
// export const sendEmailTool: RegisteredTool = { ... };
