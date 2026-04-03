import { tool, zodSchema } from "ai";
import { z } from "zod";
import { logAction } from "@/lib/actions/log-action";

export function createGithubCommentTool(userId: string) {
  return tool({
    description:
      "Comment on a GitHub issue. This is a HIGH-RISK action that requires CIBA phone approval before the comment is posted. Requires the user to have connected their GitHub account.",
    inputSchema: zodSchema(z.object({
      owner: z
        .string()
        .describe("Repository owner (username or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("The issue number to comment on"),
      body: z.string().describe("The comment body (markdown supported)"),
    })),
    execute: async ({ owner, repo, issueNumber, body }) => {
      // TODO: Wire up Token Vault + CIBA for GitHub comment
      try {
        await logAction({
          userId,
          action: "github.comment",
          toolName: "github-comment",
          riskLevel: "high",
          status: "failed",
          inputSummary: `Comment on ${owner}/${repo}#${issueNumber}`,
          outputSummary:
            "GitHub account not connected — Token Vault not yet configured",
        });

        return {
          error:
            "GitHub account not connected. Please connect your GitHub account using the connection button in the footer.",
        };
      } catch (error) {
        return { error: "Failed to comment on GitHub issue" };
      }
    },
  });
}
