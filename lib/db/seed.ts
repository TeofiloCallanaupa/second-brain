import { db } from "./client";
import { brainEntries } from "./schema";

const sampleEntries = [
  {
    path: "career",
    title: "Career",
    category: "area",
    tags: ["jobs", "work"],
    content: `# Career

## Current Status
- Actively looking for SWE roles
- Focusing on AI/ML and full-stack positions
- Interested in startups and high-growth companies

## Leads
| Company | Role | Status | Date Added |
|---|---|---|---|
| Acme Corp | Senior SWE | Applied | 2026-03-15 |
| TechStart | Full Stack | Phone Screen | 2026-03-20 |
| DataFlow | ML Engineer | Interested | 2026-03-25 |

## Skills
- TypeScript, Python, React, Next.js
- PostgreSQL, Redis
- AWS, Vercel
- LLMs, RAG, Agent frameworks`,
  },
  {
    path: "journal/2026-03-28",
    title: "Friday, March 28, 2026",
    category: "journal",
    tags: ["daily"],
    content: `# Friday, March 28, 2026

## Tasks
- [ ] Review pull request for auth module
- [ ] Prepare for Monday standup
- [x] Submit hackathon registration
- [ ] Read Auth0 Token Vault docs

## Notes
- Auth0 hackathon deadline is April 7
- Need to set up Google OAuth in testing mode
- GitHub integration should use CIBA for write actions`,
  },
  {
    path: "journal/2026-03-29",
    title: "Saturday, March 29, 2026",
    category: "journal",
    tags: ["daily"],
    content: `# Saturday, March 29, 2026

## Tasks
- [ ] Build Second Brain MVP
- [ ] Set up Neon PostgreSQL
- [ ] Configure Auth0 Token Vault
- [ ] Create demo video outline

## Notes
- Decided on Google + GitHub as Token Vault integrations
- Architecture: DB stores markdown, Google/GitHub are I/O channels
- FGA separates work vs personal knowledge`,
  },
  {
    path: "learning/ai",
    title: "AI Resources",
    category: "resource",
    tags: ["ai", "learning", "llm"],
    content: `# AI Resources

## Key Concepts
- **RAG (Retrieval Augmented Generation):** Query a knowledge base to provide context to an LLM
- **MCP (Model Context Protocol):** Standard for AI clients to connect to tools and data
- **Token Vault:** Auth0 feature for secure OAuth token management for AI agents
- **CIBA:** Client Initiated Backchannel Authentication — async approval for agent actions

## Tools & Frameworks
| Tool | Purpose |
|---|---|
| Vercel AI SDK | AI streaming + tool calling |
| Auth0 AI SDK | Token Vault + FGA + CIBA |
| Drizzle ORM | Type-safe database queries |
| Next.js | Full-stack React framework |`,
  },
  {
    path: "learning/auth0",
    title: "Auth0 for AI Agents",
    category: "resource",
    tags: ["auth0", "security", "ai"],
    content: `# Auth0 for AI Agents

## Token Vault
- Stores OAuth tokens securely (encrypted, managed by Auth0)
- Agent requests short-lived access tokens on demand
- Handles token refresh automatically
- One Google connection = Gmail + Calendar + Drive + Sheets

## CIBA (Client Initiated Backchannel Auth)
- Asks user for approval on another device before risky actions
- Flow: Agent wants to act → Auth0 sends push → User approves → Agent proceeds
- Used for: sending emails, GitHub comments, deleting entries

## Risk Levels
| Level | Examples | Auth |
|---|---|---|
| Low | Read brain, read calendar | Just do it |
| Medium | Write to brain, create calendar event | Standard auth |
| High | Send email, comment on GitHub | CIBA approval |
| Critical | Delete entries, create PRs | CIBA + confirmation |`,
  },
  {
    path: "projects/second-brain",
    title: "Second Brain Hackathon Project",
    category: "project",
    tags: ["hackathon", "auth0", "ai"],
    content: `# Second Brain — Hackathon Project

## Overview
AI-powered personal knowledge management system using Auth0 Token Vault.

## Architecture
- Brain = PostgreSQL storing markdown entries
- I/O = Google (Gmail, Calendar) + GitHub via Token Vault
- Security = CIBA for risky actions, full audit trail

## Status
- [x] Research and planning
- [x] MVP implementation
- [ ] Auth0 integration
- [ ] Demo video
- [ ] Devpost submission

## Deadline
April 7, 2026 @ 2:45am EDT`,
  },
  {
    path: "profile",
    title: "Personal Profile",
    category: "area",
    tags: ["personal"],
    content: `# Profile

## About
- Software developer
- Interested in AI, full-stack development, and personal productivity

## Preferences
- Prefers markdown for notes
- Uses git for version control
- Values privacy and data ownership`,
  },
  {
    path: "goals",
    title: "Goals",
    category: "area",
    tags: ["personal", "goals"],
    content: `# Goals

## 2026
- [ ] Win an AI hackathon
- [ ] Land a senior engineering role
- [ ] Build a personal AI assistant
- [ ] Read 12 books this year
- [ ] Contribute to open source monthly`,
  },
];

export async function seedBrain(userId: string) {
  console.log("🧠 Seeding brain entries...");

  for (const entry of sampleEntries) {
    await db
      .insert(brainEntries)
      .values({
        userId,
        path: entry.path,
        title: entry.title,
        content: entry.content,
        category: entry.category,
        tags: entry.tags,
      })
      .onConflictDoNothing();
  }

  console.log(`✅ Seeded ${sampleEntries.length} brain entries for user ${userId}`);
}
