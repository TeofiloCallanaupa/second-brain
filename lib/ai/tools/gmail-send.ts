import { tool, zodSchema } from "ai";
import { z } from "zod";
import { google } from "googleapis";
import { getAccessToken, withGoogleConnection } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";

export function createGmailSendTool(userId: string) {
  return withGoogleConnection(
    tool({
      description:
        "Send an email via the user's Gmail account. The user must have connected their Google account first using the Connect Google button in the footer.",
      inputSchema: zodSchema(
        z.object({
          to: z.string().describe("Recipient email address"),
          subject: z.string().describe("Email subject line"),
          body: z.string().describe("Email body content (plain text)"),
        })
      ),
      execute: async ({ to, subject, body }) => {
        try {
          const accessToken = await getAccessToken();

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
            outputSummary: "Email sent successfully",
          });

          return {
            success: true,
            message: `Email sent to ${to} with subject "${subject}"`,
          };
        } catch (error: any) {
          console.error("[gmail-send] Error:", error?.message || error);

          await logAction({
            userId,
            action: "gmail.send",
            toolName: "gmail-send",
            riskLevel: "high",
            status: "failed",
            inputSummary: `Send email to ${to}: "${subject}"`,
            outputSummary: `Error: ${error?.message || "Unknown error"}`,
          });

          return {
            error:
              "Could not access Gmail. The user needs to connect their Google account by clicking the 'Google' button in the footer bar and completing the authorization flow, then try again.",
          };
        }
      },
    })
  );
}
