interface SendEmailResponse {
	success: boolean;
	message?: string;
}

/**
 * 发送电子邮件
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<SendEmailResponse> {
	try {
		const response = await fetch("https://api.useplunk.com/v1/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${import.meta.env.PLUNK_API_KEY}`,
			},
			body: JSON.stringify({
				to,
				subject,
				body,
			}),
		});

		return { success: response.ok };
	} catch (error) {
		return { success: false, message: String(error) };
	}
}
