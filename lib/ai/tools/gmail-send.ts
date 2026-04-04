import { tool, zodSchema } from "ai";
import { z } from "zod";
import { logAction } from "@/lib/actions/log-action";
import { getGoogleAccessToken } from "@/lib/auth0-ai";
import { google } from "googleapis";

export function createGmailSendTool(userId: string) {
  return tool({
    description:
      "Send an email via the user's Gmail account. The user will be asked to approve before sending.",
    inputSchema: zodSchema(
      z.object({
        to: z.string().describe("Recipient email address"),
        subject: z.string().describe("Email subject line"),
        body: z.string().describe("Email body content (plain text)"),
      })
    ),
    // This is the key: the SDK will pause execution and show approval UI
    needsApproval: true,
    execute: async ({ to, subject, body }) => {
      // This only runs AFTER the user approves
      try {
        const accessToken = await getGoogleAccessToken();
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: "v1", auth });

        const email = [
          `To: ${to}`,
          `Subject: ${subject}`,
          "Content-Type: text/plain; charset=utf-8",
          "",
          body,
        ].join("\n");

        const encodedEmail = Buffer.from(email)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        await gmail.users.messages.send({
          userId: "me",
          requestBody: { raw: encodedEmail },
        });

        await logAction({
          userId,
          action: "gmail.send",
          toolName: "gmail-send",
          riskLevel: "high",
          status: "success",
          inputSummary: `Send email to ${to}: "${subject}"`,
          outputSummary: "Email sent after user approval",
        });

        return `Email successfully sent to ${to} with subject "${subject}"`;
      } catch (error: any) {
        await logAction({
          userId,
          action: "gmail.send",
          toolName: "gmail-send",
          riskLevel: "high",
          status: "failed",
          inputSummary: `Send email to ${to}: "${subject}"`,
          outputSummary: error?.message || "Failed to send email",
        });
        return `Failed to send email: ${error?.message}`;
      }
    },
  });
}
