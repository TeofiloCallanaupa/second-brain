import { tool, zodSchema } from "ai";
import { z } from "zod";
import { google } from "googleapis";
import { getGoogleAccessToken } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";

export function createGmailReadTool(userId: string) {
  return tool({
    description:
      "Read recent emails from the user's Gmail inbox. Can optionally filter by a search query.",
    inputSchema: zodSchema(
      z.object({
        query: z
          .string()
          .optional()
          .describe(
            'Optional Gmail search query, e.g. "from:boss@company.com" or "is:unread"'
          ),
        maxResults: z
          .number()
          .optional()
          .default(5)
          .describe("Maximum number of emails to return (default: 5)"),
      })
    ),
    execute: async ({ query, maxResults }) => {
      try {
        const accessToken = await getGoogleAccessToken();

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: "v1", auth });

        const listResponse = await gmail.users.messages.list({
          userId: "me",
          q: query || "",
          maxResults: maxResults || 5,
        });

        const messageIds = listResponse.data.messages || [];

        const emails = await Promise.all(
          messageIds.slice(0, maxResults || 5).map(async (msg) => {
            const detail = await gmail.users.messages.get({
              userId: "me",
              id: msg.id!,
              format: "metadata",
              metadataHeaders: ["From", "Subject", "Date"],
            });

            const headers = detail.data.payload?.headers || [];
            const getHeader = (name: string) =>
              headers.find(
                (h) => h.name?.toLowerCase() === name.toLowerCase()
              )?.value || "";

            return {
              id: msg.id,
              from: getHeader("From"),
              subject: getHeader("Subject"),
              date: getHeader("Date"),
              snippet: detail.data.snippet || "",
            };
          })
        );

        await logAction({
          userId,
          action: "gmail.read",
          toolName: "gmail-read",
          riskLevel: "low",
          status: "success",
          inputSummary: `Read emails${query ? ` matching: "${query}"` : ""} (max: ${maxResults})`,
          outputSummary: `Found ${emails.length} emails`,
        });

        return { emails, count: emails.length };
      } catch (error: any) {
        console.error("[gmail-read] Error:", error?.message || error);

        await logAction({
          userId,
          action: "gmail.read",
          toolName: "gmail-read",
          riskLevel: "low",
          status: "failed",
          inputSummary: `Read emails${query ? ` matching: "${query}"` : ""}`,
          outputSummary: `Error: ${error?.message || "Unknown error"}`,
        });

        return {
          error:
            "Could not access Gmail. The user needs to connect their Google account by clicking the 'Google' button in the footer bar, then try again.",
        };
      }
    },
  });
}
