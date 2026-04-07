import { groq } from "@ai-sdk/groq";
import {
  streamText,
  stepCountIs,
  convertToModelMessages,
} from "ai";
import { auth0 } from "@/lib/auth0";
import { createAgentTools } from "@/lib/ai/agent";
import { getSystemPrompt } from "@/lib/ai/system-prompt";
import { db } from "@/lib/db/client";
import { chatMessages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.sub;
  const { messages } = await req.json();

  // Persist the latest user message
  const latestMessage = messages[messages.length - 1];
  if (latestMessage?.role === "user") {
    const textContent =
      latestMessage.parts
        ?.filter((p: { type: string }) => p.type === "text")
        ?.map((p: { text: string }) => p.text)
        ?.join("") ||
      latestMessage.content ||
      "";

    if (textContent) {
      await db.insert(chatMessages).values({
        userId,
        role: "user",
        content: textContent,
      });
    }
  }

  const tools = createAgentTools(userId);
  const modelMessages = await convertToModelMessages(messages);

  try {
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: getSystemPrompt(),
      messages: modelMessages,
      tools,
      maxRetries: 2,
      stopWhen: stepCountIs(3),
      onError: async (err) => {
        console.error("streamText error:", err);
      },
      onFinish: async ({ text }) => {
        if (text) {
          await db.insert(chatMessages).values({
            userId,
            role: "assistant",
            content: text,
          });
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err: unknown) {
    console.error("Chat route error:", err);

    // Fallback: retry without tools for malformed tool call errors
    const errMsg = err instanceof Error ? err.message : "";
    if (errMsg.includes("Failed to call a function")) {
      const fallback = streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: getSystemPrompt(),
        messages: modelMessages,
      });
      return fallback.toUIMessageStreamResponse();
    }

    return new Response("Something went wrong", { status: 500 });
  }
}

export async function GET() {
  const session = await auth0.getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.sub;

  const msgs = await db
    .select({
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(asc(chatMessages.createdAt));

  return Response.json({ messages: msgs });
}
