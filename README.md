# Second Brain — AI-Powered Knowledge Management

An agentic AI personal assistant that connects to your Gmail, Google Calendar, GitHub, and Notion — all through a single chat interface with human-in-the-loop approval for every action.

## What It Does

**Second Brain** lets you interact with all your productivity tools through natural conversation. Instead of switching between apps, you chat with an AI agent that reads your emails, checks your calendar, browses your repos, and manages a personal knowledge base — all while asking your permission before taking any action.

### Key Features

| Feature | Description |
|---|---|
| **Multi-Service Integration** | Gmail, Google Calendar, GitHub, and Notion connected via Auth0 Token Vault |
| **13 AI Tools** | Read/send emails, read/create calendar events, browse repos/issues/comments, search/read Notion, and full brain CRUD |
| **Human-in-the-Loop** | Every write action (send email, post comment, create event) requires explicit user approval with a preview card |
| **Personal Knowledge Base** | AI-managed markdown documents organized into journals, projects, areas, and resources |
| **AI Preferences** | A customizable `AI_PREFERENCES` file that teaches the AI your preferred formatting and writing style |
| **Inline Document Editor** | Edit your knowledge base entries directly — no need to go through the AI |
| **Mobile Responsive** | Full mobile support with hamburger menu and overlay panels |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Next.js App                    │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Landing   │  │Dashboard │  │ API Routes   │  │
│  │ Page      │  │ + Chat   │  │ /api/chat    │  │
│  │           │  │ + Brain  │  │ /api/brain   │  │
│  └──────────┘  └──────────┘  │ /api/approve  │  │
│                               │ /api/connect  │  │
│                               └──────┬───────┘  │
│                                      │           │
│  ┌───────────────────────────────────┘           │
│  │                                               │
│  ▼                                               │
│  ┌──────────────────────────────────────────┐   │
│  │           Vercel AI SDK                   │   │
│  │    streamText + Human-in-the-Loop         │   │
│  │                                           │   │
│  │  ┌─────────────────────────────────────┐  │   │
│  │  │           13 AI Tools               │  │   │
│  │  │                                     │  │   │
│  │  │  Brain: list, read, write, search   │  │   │
│  │  │  Gmail: read, send*                 │  │   │
│  │  │  Calendar: read, create*            │  │   │
│  │  │  GitHub: repos, issues, comment*    │  │   │
│  │  │  Notion: search, read              │  │   │
│  │  │                                     │  │   │
│  │  │  * = requires user approval         │  │   │
│  │  └─────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Auth0    │  │ Neon     │  │ Groq         │  │
│  │ + Token  │  │ Postgres │  │ Llama 3.3    │  │
│  │ Vault    │  │          │  │ 70B          │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **AI:** Vercel AI SDK, Groq (Llama 3.3 70B Versatile)
- **Auth:** Auth0 with Token Vault for OAuth credential management
- **Database:** Neon Postgres with Drizzle ORM
- **Deployment:** Vercel

## How the Approval Flow Works

1. User asks: *"Schedule a meeting with Alex tomorrow at 2pm"*
2. AI calls `calendarCreate` tool → intercepted by the SDK
3. A **preview card** appears inline in the chat showing the event details
4. User clicks **Approve** or **Deny**
5. If approved → event is created, AI confirms
6. If denied → AI acknowledges and moves on (no retry)

This ensures the AI never takes destructive actions without explicit consent.

## Getting Started

### Prerequisites

- Node.js 18+
- Auth0 account with Token Vault enabled
- Neon Postgres database
- Groq API key

### Environment Variables

Create `.env.local`:

```bash
# Auth0
AUTH0_SECRET=
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Database
DATABASE_URL=

# AI
GROQ_API_KEY=

# Auth0 Token Vault
AUTH0_TOKEN_VAULT_BASE_URL=
```

### Setup

```bash
# Install dependencies
npm install

# Push database schema
npx drizzle-kit push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
second-brain-app/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── dashboard/               # Protected dashboard
│   └── api/
│       ├── chat/route.ts        # AI chat endpoint
│       ├── brain/route.ts       # Knowledge base CRUD
│       ├── approve-action/      # Tool approval handler
│       ├── connections/         # Connection status
│       └── connect/             # OAuth connection flow
├── components/
│   ├── ChatInterface.tsx        # Chat UI with approval cards
│   ├── DashboardClient.tsx      # Main dashboard layout
│   ├── BrainSidebar.tsx         # Knowledge tree sidebar
│   ├── DocumentViewer.tsx       # Markdown viewer/editor
│   └── ActionLogModal.tsx       # Action audit log
├── lib/
│   ├── ai/
│   │   ├── agent.ts             # Tool registry
│   │   ├── system-prompt.ts     # Dynamic system prompt
│   │   └── tools/               # 13 AI tool implementations
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema
│   │   └── client.ts            # Database client
│   ├── auth0.ts                 # Auth0 config
│   └── auth0-ai.ts              # Token Vault helpers
```

## Built For

Auth0 Vibe Coding Hackathon — Demonstrating agentic AI with secure credential management through Auth0 Token Vault.

[DevPost Submission](https://devpost.com/software/second-brain-7uqxec)

## License

MIT
