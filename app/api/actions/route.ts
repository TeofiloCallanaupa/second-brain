import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db/client";
import { actionLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth0.getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.sub;

  const logs = await db
    .select()
    .from(actionLogs)
    .where(eq(actionLogs.userId, userId))
    .orderBy(desc(actionLogs.createdAt))
    .limit(50);

  return Response.json({ logs });
}
