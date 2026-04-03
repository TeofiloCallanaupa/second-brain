import { tool, zodSchema } from "ai";
import { z } from "zod";
import { logAction } from "@/lib/actions/log-action";

export function createGmailSendTool(userId: string) {
  return tool({
    description:
      "Send an email via the user's Gmail account. This is a HIGH-RISK action that requires CIBA phone approval before the email is sent. Requires the user to have connected their Google account.",
    inputSchema: zodSchema(z.object({
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Email subject line"),
      body: z.string().describe("Email body content (plain text)"),
    })),
    execute: async ({ to, subject, body }) => {
      // TODO: Wire up Token Vault + CIBA for Gmail send
      try {
        await logAction({
          userId,
          action: "gmail.send",
          toolName: "gmail-send",
          riskLevel: "high",
          status: "failed",
          inputSummary: `Send email to ${to}: "${subject}"`,
          outputSummary:
            "Google account not connected — Token Vault not yet configured",
        });

        return {
          error:
            "Google account not connected. Please connect your Google account using the connection button in the footer.",
        };
      } catch (error) {
        return { error: "Failed to send email" };
      }
    },
  });
}
