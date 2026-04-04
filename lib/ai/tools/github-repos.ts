import { tool, zodSchema } from "ai";
import { z } from "zod";
import { getGitHubAccessToken } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";

export function createGithubReposTool(userId: string) {
  return tool({
    description:
      "List the user's GitHub repositories. Use this first to discover what repos the user has before trying to read issues or comment.",
    inputSchema: zodSchema(
      z.object({
        type: z
          .enum(["all", "owner", "member"])
          .optional()
          .default("owner")
          .describe("Filter repos: 'owner' (default), 'all', or 'member'"),
        sort: z
          .enum(["updated", "created", "pushed", "full_name"])
          .optional()
          .default("updated")
          .describe("Sort by: 'updated' (default), 'created', 'pushed', 'full_name'"),
      })
    ),
    execute: async ({ type, sort }) => {
      try {
        const accessToken = await getGitHubAccessToken();

        const response = await fetch(
          `https://api.github.com/user/repos?type=${type || "owner"}&sort=${sort || "updated"}&per_page=20`,
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

        const repos = await response.json();

        const formatted = repos.map((repo: any) => ({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || "",
          language: repo.language || "Unknown",
          stars: repo.stargazers_count,
          openIssues: repo.open_issues_count,
          updatedAt: repo.updated_at,
          isPrivate: repo.private,
          url: repo.html_url,
        }));

        await logAction({
          userId,
          action: "github.repos",
          toolName: "github-repos",
          riskLevel: "low",
          status: "success",
          inputSummary: `List repos (type: ${type}, sort: ${sort})`,
          outputSummary: `Found ${formatted.length} repositories`,
        });

        return { repos: formatted, count: formatted.length };
      } catch (error: any) {
        console.error("[github-repos] Error:", error?.message || error);

        await logAction({
          userId,
          action: "github.repos",
          toolName: "github-repos",
          riskLevel: "low",
          status: "failed",
          inputSummary: `List repos`,
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
