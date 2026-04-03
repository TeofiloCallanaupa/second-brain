import { tool, zodSchema } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { brainEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAction } from "@/lib/actions/log-action";

export function createBrainListTool(userId: string) {
  return tool({
    description:
      "List all brain entries. Returns paths, titles, categories, and last-updated timestamps (without full content). Optionally filter by category.",
    inputSchema: zodSchema(z.object({
      category: z
        .enum(["journal", "project", "area", "resource", "general"])
        .optional()
        .describe("Optional category to filter by"),
    })),
    execute: async ({ category }) => {
      try {
        let query = db
          .select({
            path: brainEntries.path,
            title: brainEntries.title,
            category: brainEntries.category,
            tags: brainEntries.tags,
            updatedAt: brainEntries.updatedAt,
          })
          .from(brainEntries)
          .where(eq(brainEntries.userId, userId));

        const results = await query;

        // Filter by category in JS if provided (simpler than dynamic SQL)
        const filtered = category
          ? results.filter((r) => r.category === category)
          : results;

        // Sort by path for consistent display
        filtered.sort((a, b) => a.path.localeCompare(b.path));

        await logAction({
          userId,
          action: "brain.list",
          toolName: "brain-list",
          riskLevel: "low",
          status: "success",
          inputSummary: category
            ? `List entries in category: ${category}`
            : "List all entries",
          outputSummary: `Found ${filtered.length} entries`,
        });

        return { entries: filtered, count: filtered.length };
      } catch (error) {
        await logAction({
          userId,
          action: "brain.list",
          toolName: "brain-list",
          riskLevel: "low",
          status: "failed",
          inputSummary: "List entries",
          outputSummary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        return { error: "Failed to list brain entries" };
      }
    },
  });
}
