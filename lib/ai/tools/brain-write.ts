import { tool, zodSchema } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { brainEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logAction } from "@/lib/actions/log-action";

export function createBrainWriteTool(userId: string) {
  return tool({
    description:
      "Create or update a brain entry. If an entry with the same path already exists, it will be updated. Use this to save new knowledge or update existing entries.",
    inputSchema: zodSchema(z.object({
      path: z
        .string()
        .describe(
          'The path for the entry, e.g. "career", "journal/2026-03-28", "learning/ai"'
        ),
      title: z.string().describe("A human-readable title for the entry"),
      content: z
        .string()
        .describe("The full markdown content of the entry"),
      category: z
        .enum(["journal", "project", "area", "resource", "general"])
        .optional()
        .describe("Category of the entry"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Tags for filtering and organization"),
    })),
    execute: async ({ path, title, content, category, tags }) => {
      try {
        // Check if entry exists
        const existing = await db
          .select({ id: brainEntries.id })
          .from(brainEntries)
          .where(
            and(eq(brainEntries.userId, userId), eq(brainEntries.path, path))
          );

        if (existing.length > 0) {
          // Update
          await db
            .update(brainEntries)
            .set({
              title,
              content,
              category: category || "general",
              tags: tags || [],
              updatedAt: new Date(),
            })
            .where(
              and(eq(brainEntries.userId, userId), eq(brainEntries.path, path))
            );
        } else {
          // Insert
          await db.insert(brainEntries).values({
            userId,
            path,
            title,
            content,
            category: category || "general",
            tags: tags || [],
          });
        }

        await logAction({
          userId,
          action: existing.length > 0 ? "brain.update" : "brain.create",
          toolName: "brain-write",
          riskLevel: "medium",
          status: "success",
          inputSummary: `${existing.length > 0 ? "Updated" : "Created"} entry at path: ${path}`,
          outputSummary: `"${title}" — ${content.length} chars`,
        });

        return {
          success: true,
          action: existing.length > 0 ? "updated" : "created",
          path,
          title,
        };
      } catch (error) {
        await logAction({
          userId,
          action: "brain.write",
          toolName: "brain-write",
          riskLevel: "medium",
          status: "failed",
          inputSummary: `Write entry at path: ${path}`,
          outputSummary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        return { error: "Failed to write brain entry" };
      }
    },
  });
}
