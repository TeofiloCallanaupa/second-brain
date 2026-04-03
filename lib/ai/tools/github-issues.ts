import { tool, zodSchema } from "ai";
import { z } from "zod";
import { logAction } from "@/lib/actions/log-action";

export function createGithubIssuesTool(userId: string) {
  return tool({
    description:
      "Read issues from a GitHub repository. Requires the user to have connected their GitHub account.",
    inputSchema: zodSchema(z.object({
      owner: z
        .string()
        .describe("Repository owner (username or organization)"),
      repo: z.string().describe("Repository name"),
      state: z
        .enum(["open", "closed", "all"])
        .optional()
        .default("open")
        .describe("Filter by issue state (default: open)"),
    })),
    execute: async ({ owner, repo, state }) => {
      // TODO: Wire up Token Vault for GitHub OAuth
      try {
        await logAction({
          userId,
          action: "github.issues",
          toolName: "github-issues",
          riskLevel: "low",
          status: "failed",
          inputSummary: `Read ${state} issues from ${owner}/${repo}`,
          outputSummary:
            "GitHub account not connected — Token Vault not yet configured",
        });

        return {
          error:
            "GitHub account not connected. Please connect your GitHub account using the connection button in the footer.",
        };
      } catch (error) {
        return { error: "Failed to read GitHub issues" };
      }
    },
  });
}
