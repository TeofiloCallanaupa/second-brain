import { tool, zodSchema } from "ai";
import { z } from "zod";
import { getNotionAccessToken } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";

export function createNotionSearchTool(userId: string) {
  return tool({
    description:
      "Search the user's Notion workspace for pages and databases. Returns matching page titles and IDs.",
    inputSchema: zodSchema(
      z.object({
        query: z
          .string()
          .describe("The search query to find pages or databases in Notion"),
        maxResults: z
          .number()
          .optional()
          .default(5)
          .describe("Maximum number of results to return (default: 5)"),
      })
    ),
    execute: async ({ query, maxResults }) => {
      try {
        const accessToken = await getNotionAccessToken();

        const response = await fetch("https://api.notion.com/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            page_size: maxResults || 5,
            sort: {
              direction: "descending",
              timestamp: "last_edited_time",
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Notion API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        const results = data.results.map((item: any) => {
          const titleProp = Object.values(item.properties || {}).find(
              (prop: any) => prop.type === "title"
            ) as any;
          const title =
            item.properties?.title?.title?.[0]?.plain_text ||
            item.properties?.Name?.title?.[0]?.plain_text ||
            titleProp?.title?.[0]?.plain_text ||
            "Untitled";

          return {
            id: item.id,
            type: item.object, // "page" or "database"
            title,
            url: item.url,
            lastEdited: item.last_edited_time,
            icon: item.icon?.emoji || item.icon?.external?.url || null,
          };
        });

        await logAction({
          userId,
          action: "notion.search",
          toolName: "notion-search",
          riskLevel: "low",
          status: "success",
          inputSummary: `Searched Notion for: "${query}"`,
          outputSummary: `Found ${results.length} results`,
        });

        return { results, count: results.length };
      } catch (error: any) {
        console.error("[notion-search] Error:", error?.message || error);

        await logAction({
          userId,
          action: "notion.search",
          toolName: "notion-search",
          riskLevel: "low",
          status: "failed",
          inputSummary: `Searched Notion for: "${query}"`,
          outputSummary: `Error: ${error?.message || "Unknown error"}`,
        });

        return {
          error:
            "Could not access Notion. The user needs to connect their Notion account by clicking the 'Notion' button in the footer bar, then try again.",
        };
      }
    },
  });
}
