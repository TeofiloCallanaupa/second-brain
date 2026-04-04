import { tool, zodSchema } from "ai";
import { z } from "zod";
import { getGitHubAccessToken } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";

export function createGithubIssuesTool(userId: string) {
  return tool({
    description:
      "Read issues from a GitHub repository.",
    inputSchema: zodSchema(
      z.object({
        owner: z
          .string()
          .describe("Repository owner (username or organization)"),
        repo: z.string().describe("Repository name"),
        state: z
          .enum(["open", "closed", "all"])
          .optional()
          .default("open")
          .describe("Filter by issue state (default: open)"),
      })
    ),
    execute: async ({ owner, repo, state }) => {
      try {
        const accessToken = await getGitHubAccessToken();

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=${state || "open"}&per_page=10`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "SecondBrain-Agent",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `GitHub API error: ${response.status} ${response.statusText}`
          );
        }

        const issues = await response.json();

        const formatted = issues.map((issue: any) => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          author: issue.user?.login,
          labels: issue.labels?.map((l: any) => l.name) || [],
          createdAt: issue.created_at,
          url: issue.html_url,
        }));

        await logAction({
          userId,
          action: "github.issues",
          toolName: "github-issues",
          riskLevel: "low",
          status: "success",
          inputSummary: `Read ${state} issues from ${owner}/${repo}`,
          outputSummary: `Found ${formatted.length} issues`,
        });

        return { issues: formatted, count: formatted.length };
      } catch (error: any) {
        console.error("[github-issues] Error:", error?.message || error);

        await logAction({
          userId,
          action: "github.issues",
          toolName: "github-issues",
          riskLevel: "low",
          status: "failed",
          inputSummary: `Read ${state} issues from ${owner}/${repo}`,
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
