import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db/client";
import { brainEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const STARTER_ENTRIES = [
  {
    path: "welcome",
    title: "Welcome to Second Brain",
    category: "resource",
    tags: ["getting-started"],
    content: `# Welcome to Second Brain 🧠

Your AI-powered personal knowledge system. Here's how to get started:

## How It Works
- **Chat** with your AI assistant to read, write, and search your brain
- **Organize** entries into categories: journals, projects, areas, and resources
- **Connect** Gmail and GitHub to let your AI act on your behalf

## Try Saying
- "Save a note about my weekend plans"
- "List all my brain entries"
- "Search my brain for goals"
- "Read my goals"

## Categories
| Category | Purpose |
|---|---|
| **Journal** | Daily logs, tasks, reflections |
| **Project** | Active projects with deadlines |
| **Area** | Ongoing life areas (career, health, finances) |
| **Resource** | Learning materials, references, bookmarks |

Start by asking the AI to save something — your brain grows with every conversation!`,
  },
  {
    path: "goals",
    title: "My Goals",
    category: "area",
    tags: ["personal", "goals"],
    content: `# My Goals

## This Year
- [ ] Add your goals here
- [ ] Ask the AI to help you plan

## Ideas
- Tell the AI what you're working on and it will help you track progress
- Say "update my goals" anytime to edit this entry`,
  },
  {
    path: "journal/today",
    title: "My First Journal Entry",
    category: "journal",
    tags: ["daily"],
    content: `# My First Journal Entry

Welcome! This is a sample journal entry.

## Tips
- Ask the AI to "write a journal entry for today" and it will create one
- Journal entries are great for daily tasks, reflections, and notes
- You can say "what did I do last week?" and the AI will search your journals`,
  },
];

export async function GET() {
  const session = await auth0.getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.sub;

  let entries = await db
    .select({
      path: brainEntries.path,
      title: brainEntries.title,
      category: brainEntries.category,
      tags: brainEntries.tags,
      content: brainEntries.content,
      updatedAt: brainEntries.updatedAt,
    })
    .from(brainEntries)
    .where(eq(brainEntries.userId, userId));

  // Auto-seed starter entries for new users
  if (entries.length === 0) {
    for (const entry of STARTER_ENTRIES) {
      await db.insert(brainEntries).values({
        userId,
        ...entry,
      });
    }
    // Re-fetch after seeding
    entries = await db
      .select({
        path: brainEntries.path,
        title: brainEntries.title,
        category: brainEntries.category,
        tags: brainEntries.tags,
        content: brainEntries.content,
        updatedAt: brainEntries.updatedAt,
      })
      .from(brainEntries)
      .where(eq(brainEntries.userId, userId));
  }

  entries.sort((a, b) => a.path.localeCompare(b.path));

  return Response.json({ entries });
}
