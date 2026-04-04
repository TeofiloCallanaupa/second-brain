import { tool, zodSchema } from "ai";
import { z } from "zod";
import { getNotionAccessToken } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";

/**
 * Recursively extract text from Notion block children.
 */
function extractTextFromBlocks(blocks: any[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    const type = block.type;
    const content = block[type];

    if (!content) continue;

    // Extract rich text from the block
    const richText = content.rich_text || content.text || [];
    const text = richText.map((t: any) => t.plain_text).join("");

    switch (type) {
      case "paragraph":
        lines.push(text);
        break;
      case "heading_1":
        lines.push(`# ${text}`);
        break;
      case "heading_2":
        lines.push(`## ${text}`);
        break;
      case "heading_3":
        lines.push(`### ${text}`);
        break;
      case "bulleted_list_item":
        lines.push(`• ${text}`);
        break;
      case "numbered_list_item":
        lines.push(`- ${text}`);
        break;
      case "to_do":
        const checked = content.checked ? "✅" : "⬜";
        lines.push(`${checked} ${text}`);
        break;
      case "toggle":
        lines.push(`▶ ${text}`);
        break;
      case "code":
        lines.push(`\`\`\`${content.language || ""}\n${text}\n\`\`\``);
        break;
      case "quote":
        lines.push(`> ${text}`);
        break;
      case "callout":
        const emoji = block.callout?.icon?.emoji || "💡";
        lines.push(`${emoji} ${text}`);
        break;
      case "divider":
        lines.push("---");
        break;
      case "image":
        const imgUrl =
          content.file?.url || content.external?.url || "";
        lines.push(`[Image: ${imgUrl}]`);
        break;
      default:
        if (text) lines.push(text);
    }
  }

  return lines.join("\n");
}

export function createNotionReadTool(userId: string) {
  return tool({
    description:
      "Read the content of a specific Notion page. Returns the page title, properties, and text content of the page blocks.",
    inputSchema: zodSchema(
      z.object({
        pageId: z
          .string()
          .describe(
            "The Notion page ID to read. This can be obtained from the notionSearch tool results."
          ),
      })
    ),
    execute: async ({ pageId }) => {
      try {
        const accessToken = await getNotionAccessToken();
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          "Notion-Version": "2022-06-28",
        };

        // 1. Get page metadata
        const pageResponse = await fetch(
          `https://api.notion.com/v1/pages/${pageId}`,
          { headers }
        );

        if (!pageResponse.ok) {
          const errorText = await pageResponse.text();
          throw new Error(
            `Notion API error (${pageResponse.status}): ${errorText}`
          );
        }

        const page = await pageResponse.json();

        // Extract title from page properties
        const titleProp = Object.values(page.properties || {}).find(
          (prop: any) => prop.type === "title"
        ) as any;
        const title =
          titleProp?.title?.[0]?.plain_text || "Untitled";

        // 2. Get page blocks (content)
        const blocksResponse = await fetch(
          `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`,
          { headers }
        );

        if (!blocksResponse.ok) {
          const errorText = await blocksResponse.text();
          throw new Error(
            `Notion blocks API error (${blocksResponse.status}): ${errorText}`
          );
        }

        const blocksData = await blocksResponse.json();
        const content = extractTextFromBlocks(blocksData.results || []);

        // 3. Extract useful properties
        const properties: Record<string, any> = {};
        for (const [key, value] of Object.entries(page.properties || {})) {
          const prop = value as any;
          switch (prop.type) {
            case "title":
              properties[key] = prop.title?.[0]?.plain_text || "";
              break;
            case "rich_text":
              properties[key] = prop.rich_text?.[0]?.plain_text || "";
              break;
            case "number":
              properties[key] = prop.number;
              break;
            case "select":
              properties[key] = prop.select?.name || "";
              break;
            case "multi_select":
              properties[key] = prop.multi_select?.map((s: any) => s.name) || [];
              break;
            case "date":
              properties[key] = prop.date?.start || "";
              break;
            case "checkbox":
              properties[key] = prop.checkbox;
              break;
            case "url":
              properties[key] = prop.url || "";
              break;
            case "status":
              properties[key] = prop.status?.name || "";
              break;
          }
        }

        await logAction({
          userId,
          action: "notion.read",
          toolName: "notion-read",
          riskLevel: "low",
          status: "success",
          inputSummary: `Read Notion page: "${title}"`,
          outputSummary: `Page content: ${content.length} characters`,
        });

        return {
          title,
          url: page.url,
          lastEdited: page.last_edited_time,
          properties,
          content,
        };
      } catch (error: any) {
        console.error("[notion-read] Error:", error?.message || error);

        await logAction({
          userId,
          action: "notion.read",
          toolName: "notion-read",
          riskLevel: "low",
          status: "failed",
          inputSummary: `Read Notion page: ${pageId}`,
          outputSummary: `Error: ${error?.message || "Unknown error"}`,
        });

        return {
          error:
            "Could not read the Notion page. Make sure the page has been shared with the Second Brain integration, and the user's Notion account is connected.",
        };
      }
    },
  });
}
