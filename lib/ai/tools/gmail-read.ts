import { tool, zodSchema } from "ai";
import { z } from "zod";
import { logAction } from "@/lib/actions/log-action";

export function createGmailReadTool(userId: string) {
  return tool({
    description:
      "Read recent emails from the user's Gmail inbox. Can optionally filter by a search query. Requires the user to have connected their Google account.",
    inputSchema: zodSchema(z.object({
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
    })),
    execute: async ({ query, maxResults }) => {
      // TODO: Wire up Token Vault for Google OAuth
      // For now, return a placeholder until Auth0 Token Vault is configured
      try {
        await logAction({
          userId,
          action: "gmail.read",
          toolName: "gmail-read",
          riskLevel: "low",
          status: "failed",
          inputSummary: `Read emails${query ? ` matching: "${query}"` : ""} (max: ${maxResults})`,
          outputSummary:
            "Google account not connected — Token Vault not yet configured",
        });

        return {
          error:
            "Google account not connected. Please connect your Google account using the connection button in the footer.",
        };
      } catch (error) {
        return { error: "Failed to read emails" };
      }
    },
  });
}
