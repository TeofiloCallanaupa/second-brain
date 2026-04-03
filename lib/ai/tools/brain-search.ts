import { tool, zodSchema } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { brainEntries } from "@/lib/db/schema";
import { eq, ilike, and, or } from "drizzle-orm";
import { logAction } from "@/lib/actions/log-action";

export function createBrainSearchTool(userId: string) {
  return tool({
    description:
      "Search across all brain entries for a keyword or phrase. Returns matching entries with a snippet of content around the match. Always use this before answering questions about the user's knowledge.",
    inputSchema: zodSchema(z.object({
      query: z
        .string()
        .describe("The search term to look for across all brain entries"),
    })),
    execute: async ({ query }) => {
      try {
        const results = await db
          .select({
            path: brainEntries.path,
            title: brainEntries.title,
            content: brainEntries.content,
            category: brainEntries.category,
            updatedAt: brainEntries.updatedAt,
          })
          .from(brainEntries)
          .where(
            and(
              eq(brainEntries.userId, userId),
              or(
                ilike(brainEntries.content, `%${query}%`),
                ilike(brainEntries.title, `%${query}%`),
                ilike(brainEntries.path, `%${query}%`)
              )
            )
          );

        await logAction({
          userId,
          action: "brain.search",
          toolName: "brain-search",
          riskLevel: "low",
          status: "success",
          inputSummary: `Search for: "${query}"`,
          outputSummary: `Found ${results.length} matching entries`,
        });

        if (results.length === 0) {
          return {
            results: [],
            message: `No brain entries found matching "${query}"`,
          };
        }

        // Return entries with content snippets around the match
        const snippets = results.map((entry) => {
          const lowerContent = entry.content.toLowerCase();
          const lowerQuery = query.toLowerCase();
          const matchIndex = lowerContent.indexOf(lowerQuery);

          let snippet = "";
          if (matchIndex >= 0) {
            const start = Math.max(0, matchIndex - 100);
            const end = Math.min(
              entry.content.length,
              matchIndex + query.length + 100
            );
            snippet =
              (start > 0 ? "..." : "") +
              entry.content.slice(start, end) +
              (end < entry.content.length ? "..." : "");
          } else {
            snippet = entry.content.slice(0, 200) + "...";
          }

          return {
            path: entry.path,
            title: entry.title,
            category: entry.category,
            snippet,
            updatedAt: entry.updatedAt,
          };
        });

        return { results: snippets, count: results.length };
      } catch (error) {
        await logAction({
          userId,
          action: "brain.search",
          toolName: "brain-search",
          riskLevel: "low",
          status: "failed",
          inputSummary: `Search for: "${query}"`,
          outputSummary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        return { error: "Failed to search brain entries" };
      }
    },
  });
}
