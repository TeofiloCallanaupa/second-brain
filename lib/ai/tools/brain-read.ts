import { tool, zodSchema } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { brainEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logAction } from "@/lib/actions/log-action";

export function createBrainReadTool(userId: string) {
  return tool({
    description:
      "Read a brain entry by its path. Returns the full markdown content of the entry.",
    inputSchema: zodSchema(z.object({
      path: z
        .string()
        .describe(
          'The path of the brain entry to read, e.g. "career", "journal/2026-03-28", "learning/ai"'
        ),
    })),
    execute: async ({ path }) => {
      try {
        const results = await db
          .select()
          .from(brainEntries)
          .where(
            and(eq(brainEntries.userId, userId), eq(brainEntries.path, path))
          );

        const entry = results[0];

        await logAction({
          userId,
          action: "brain.read",
          toolName: "brain-read",
          riskLevel: "low",
          status: entry ? "success" : "failed",
          inputSummary: `Read entry at path: ${path}`,
          outputSummary: entry
            ? `Found: "${entry.title}" (${entry.content.length} chars)`
            : `No entry found at path: ${path}`,
        });

        if (!entry) {
          return { error: `No brain entry found at path: "${path}"` };
        }

        return {
          path: entry.path,
          title: entry.title,
          content: entry.content,
          category: entry.category,
          tags: entry.tags,
          updatedAt: entry.updatedAt,
        };
      } catch (error) {
        await logAction({
          userId,
          action: "brain.read",
          toolName: "brain-read",
          riskLevel: "low",
          status: "failed",
          inputSummary: `Read entry at path: ${path}`,
          outputSummary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        return { error: "Failed to read brain entry" };
      }
    },
  });
}
