import { tool, zodSchema } from "ai";
import { z } from "zod";
import { getGitHubAccessToken } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";

export function createGithubCommentTool(userId: string) {
  return tool({
    description:
      "Comment on a GitHub issue.",
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
    execute: async ({ owner, repo, issueNumber, body }) => {
      try {
        const accessToken = await getGitHubAccessToken();

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
              "User-Agent": "SecondBrain-Agent",
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
          outputSummary: `Comment posted: ${comment.html_url}`,
        });

        return {
          success: true,
          message: `Comment posted on ${owner}/${repo}#${issueNumber}`,
          url: comment.html_url,
        };
      } catch (error: any) {
        console.error("[github-comment] Error:", error?.message || error);

        await logAction({
          userId,
          action: "github.comment",
          toolName: "github-comment",
          riskLevel: "high",
          status: "failed",
          inputSummary: `Comment on ${owner}/${repo}#${issueNumber}`,
          outputSummary: `Error: ${error?.message || "Unknown error"}`,
        });

        return {
          error:
            "Could not access GitHub. The user needs to connect their GitHub account by clicking the 'GitHub' button in the footer bar, then try again.",
        };
      }
    },
  });
}
