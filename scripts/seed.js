require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function seed() {
  const users = await sql`SELECT DISTINCT user_id FROM chat_messages LIMIT 1`;
  if (users.length === 0) {
    console.log('No users found. Log in and send a message first.');
    return;
  }
  const userId = users[0].user_id;
  console.log('Seeding brain for user:', userId);

  const entries = [
    { path: 'career', title: 'Career', category: 'area', tags: ['jobs','work'], content: '# Career\n\n## Current Status\n- Actively looking for SWE roles\n- Focusing on AI/ML and full-stack positions\n\n## Skills\n- TypeScript, Python, React, Next.js\n- PostgreSQL, Redis\n- AWS, Vercel\n- LLMs, RAG, Agent frameworks' },
    { path: 'learning/ai', title: 'AI Resources', category: 'resource', tags: ['ai','learning','llm'], content: '# AI Resources\n\n## Key Concepts\n- **RAG:** Query a knowledge base to provide context to an LLM\n- **MCP:** Standard for AI clients to connect to tools and data\n- **Token Vault:** Auth0 feature for secure OAuth token management\n- **CIBA:** Client Initiated Backchannel Authentication\n\n## Tools & Frameworks\n| Tool | Purpose |\n|---|---|\n| Vercel AI SDK | AI streaming + tool calling |\n| Auth0 AI SDK | Token Vault + CIBA |\n| Drizzle ORM | Type-safe database queries |\n| Next.js | Full-stack React framework |' },
    { path: 'learning/auth0', title: 'Auth0 for AI Agents', category: 'resource', tags: ['auth0','security'], content: '# Auth0 for AI Agents\n\n## Token Vault\n- Stores OAuth tokens securely\n- Agent requests short-lived access tokens on demand\n- Handles token refresh automatically\n\n## CIBA\n- Asks user for approval on another device before risky actions\n- Flow: Agent wants to act → Auth0 sends push → User approves → Agent proceeds\n\n## Risk Levels\n| Level | Examples | Auth |\n|---|---|---|\n| Low | Read brain, read calendar | Just do it |\n| Medium | Write to brain | Standard auth |\n| High | Send email, comment on GitHub | CIBA approval |' },
    { path: 'projects/second-brain', title: 'Second Brain Hackathon Project', category: 'project', tags: ['hackathon','auth0','ai'], content: '# Second Brain — Hackathon Project\n\n## Overview\nAI-powered personal knowledge management system using Auth0 Token Vault.\n\n## Architecture\n- Brain = PostgreSQL storing markdown entries\n- I/O = Google (Gmail) + GitHub via Token Vault\n- Security = CIBA for risky actions, full audit trail\n\n## Deadline\nApril 7, 2026 @ 2:45am EDT' },
    { path: 'goals', title: 'Goals', category: 'area', tags: ['personal','goals'], content: '# Goals\n\n## 2026\n- [ ] Win an AI hackathon\n- [ ] Land a senior engineering role\n- [ ] Build a personal AI assistant\n- [ ] Read 12 books this year' },
    { path: 'journal/2026-04-02', title: 'Wednesday, April 2, 2026', category: 'journal', tags: ['daily'], content: '# Wednesday, April 2, 2026\n\n## Tasks\n- [x] Set up Second Brain project\n- [x] Configure Auth0 + Neon DB\n- [ ] Wire up Token Vault for Gmail\n- [ ] Record demo video\n\n## Notes\n- Started building the Second Brain hackathon project\n- Using Groq for free LLM testing during development\n- Will switch to GPT-4o-mini for the final demo' },
  ];

  for (const e of entries) {
    await sql`INSERT INTO brain_entries (user_id, path, title, content, category, tags) VALUES (${userId}, ${e.path}, ${e.title}, ${e.content}, ${e.category}, ${e.tags}) ON CONFLICT DO NOTHING`;
    console.log('  ✓', e.path);
  }
  console.log('Done! Seeded', entries.length, 'entries.');
}

seed().catch(console.error);
