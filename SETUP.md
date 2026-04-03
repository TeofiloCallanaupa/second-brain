# Second Brain — Environment Setup Guide

Follow these steps in order to get all the secrets for your `.env.local` file.

---

## 1. Generate `AUTH0_SECRET`

This is a random string used to encrypt session cookies. Run this in your terminal:

```bash
openssl rand -hex 32
```

Copy the output → paste as `AUTH0_SECRET`.

---

## 2. Create an Auth0 Account + Tenant

1. Go to [auth0.com](https://auth0.com) and sign up (free tier works)
2. During signup, you'll create a **tenant** (e.g. `dev-abc123`)
3. Your `AUTH0_DOMAIN` will be something like `dev-abc123.us.auth0.com`
   - Find it in: **Settings** (gear icon, bottom-left) → **General** → **Tenant Domain**

---

## 3. Create a Regular Web Application

This is the main app that handles user login.

1. Go to **Applications** → **Applications** → **+ Create Application**
2. Name: `Second Brain`
3. Type: **Regular Web Applications**
4. Click **Create**
5. Go to the **Settings** tab and copy:
   - **Domain** → `AUTH0_DOMAIN`
   - **Client ID** → `AUTH0_CLIENT_ID`
   - **Client Secret** → `AUTH0_CLIENT_SECRET`
6. Scroll down to **Application URIs** and set:
   - **Allowed Callback URLs**: `http://localhost:3000/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
7. Click **Save Changes**

### Set `APP_BASE_URL`

```
APP_BASE_URL=http://localhost:3000
```

(Change this to your production URL when deploying to Vercel)

---

## 4. Create a Machine-to-Machine (M2M) Application

This is used by the AI agent for Token Vault and CIBA operations.

1. Go to **Applications** → **Applications** → **+ Create Application**
2. Name: `Second Brain AI Agent`
3. Type: **Machine to Machine Applications**
4. Click **Create**
5. When asked to authorize an API, select **Auth0 Management API**
6. Select these scopes/permissions:
   - `read:users`
   - `update:users`
   - `create:client_grants`
7. Click **Authorize**
8. Go to the **Settings** tab and copy:
   - **Client ID** → `AUTH0_AI_CLIENT_ID`
   - **Client Secret** → `AUTH0_AI_CLIENT_SECRET`

---

## 5. Create a Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and sign up (free tier works)
2. Click **Create Project**
   - Name: `second-brain`
   - Region: Pick the closest one to you
3. After creation, you'll see the **Connection Details** panel
4. Copy the connection string — it looks like:
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
5. Paste it as `DATABASE_URL`

### Push the database schema

After setting `DATABASE_URL` in `.env.local`, run:

```bash
cd second-brain-app
npx drizzle-kit push
```

This creates the `brain_entries`, `action_logs`, and `chat_messages` tables.

---

## 6. Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** (left sidebar) → **+ Create new secret key**
4. Name: `second-brain`
5. Copy the key → paste as `OPENAI_API_KEY`

> **Note:** You need a funded account. GPT-4o-mini is very cheap (~$0.15 per 1M input tokens), so $5 of credit will last a long time.

---

## 7. Set Up Auth0 Guardian (for CIBA — do this later)

This is needed for the push-notification approval flow on high-risk actions.

1. Install the **Auth0 Guardian** app on your phone:
   - [iOS App Store](https://apps.apple.com/app/auth0-guardian/id1093447833)
   - [Google Play Store](https://play.google.com/store/apps/details?id=com.auth0.guardian)
2. In Auth0 Dashboard → **Security** → **Multi-factor Auth**
3. Enable **Push Notifications** (via Guardian)
4. Enroll your phone by scanning the QR code

> We'll configure CIBA after the basic app is working.

---

## Final `.env.local`

After completing steps 1–6, your `.env.local` should look like:

```bash
AUTH0_DOMAIN=dev-abc123.us.auth0.com
AUTH0_CLIENT_ID=aBcDeFgHiJkLmNoPqRsT
AUTH0_CLIENT_SECRET=long-random-secret-from-auth0
AUTH0_SECRET=your-64-char-hex-from-step-1

APP_BASE_URL=http://localhost:3000

AUTH0_AI_CLIENT_ID=m2m-client-id
AUTH0_AI_CLIENT_SECRET=m2m-client-secret

DATABASE_URL=postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/dbname?sslmode=require

OPENAI_API_KEY=sk-proj-your-key-here
```

---

## Verify Everything Works

```bash
# 1. Push DB schema
npx drizzle-kit push

# 2. Start the dev server
npm run dev

# 3. Open http://localhost:3000
# 4. Click "Get Started" → you should see Auth0 login screen
# 5. Log in → you should land on the dashboard with chat
# 6. Try typing "List all my brain entries" in the chat
```

If the chat responds, everything is wired up correctly! 🎉
