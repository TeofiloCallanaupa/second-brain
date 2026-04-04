import { tool, zodSchema } from "ai";
import { z } from "zod";
import { logAction } from "@/lib/actions/log-action";
import { getGitHubAccessToken } from "@/lib/auth0-ai";

export function createGithubCommentTool(userId: string) {
  return tool({
    description:
      "Comment on a GitHub issue. The user will be asked to approve before posting.",
    inputSchema: zodSchema(
      z.object({
        owner: z
          .string()
          .describe("Repository owner (username or organization)"),
        repo: z.string().describe("Repository name"),
        issueNumber: z.number().describe("The issue number to comment on"),
        body: z
          .string()
          .describe("The comment body (markdown supported)"),
      })
    ),
    needsApproval: true,
    execute: async ({ owner, repo, issueNumber, body }) => {
      // This only runs AFTER the user approves
      try {
        const accessToken = await getGitHubAccessToken();

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "SecondBrain-Agent",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ body }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `GitHub API error: ${response.status} ${response.statusText}`
          );
        }

        const comment = await response.json();

        await logAction({
          userId,
          action: "github.comment",
          toolName: "github-comment",
          riskLevel: "high",
          status: "success",
          inputSummary: `Comment on ${owner}/${repo}#${issueNumber}`,
          outputSummary: "Comment posted after user approval",
        });

        return `Comment posted on ${owner}/${repo}#${issueNumber}: ${comment.html_url}`;
      } catch (error: any) {
        await logAction({
          userId,
          action: "github.comment",
          toolName: "github-comment",
          riskLevel: "high",
          status: "failed",
          inputSummary: `Comment on ${owner}/${repo}#${issueNumber}`,
          outputSummary: error?.message || "Failed to post comment",
        });
        return `Failed to post comment: ${error?.message}`;
      }
    },
  });
}
