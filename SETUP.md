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
7. Scroll down to **Advanced Settings** → **Grant Types** and make sure these are checked:
   - ✅ Authorization Code
   - ✅ Refresh Token
   - ✅ Token Vault
8. Click **Save Changes**

### Authorize the My Account API (required for Connected Accounts)

1. Go to **Applications** → **APIs**
2. Click **My Account API: Activate** to enable it
3. Once activated, click into the **My Account API**
4. Go to the **Settings** tab → under **Access Settings**, enable **Allow Skipping User Consent**
5. Go to the **Application Access** tab
6. Find your **Second Brain** (Regular Web App) → click **Edit**
7. Set User Access Authorization to **Authorized**
8. Under Permissions, select ALL Connected Accounts scopes:
   - `create:me:connected_accounts`
   - `read:me:connected_accounts`
   - `delete:me:connected_accounts`
9. Click **Save**

### Configure Multi-Resource Refresh Token (MRRT)

This step is **critical** — without it, the refresh token cannot request My Account API access tokens.

1. Go to **Applications** → **Applications** → **Second Brain**
2. Find the **Multi-Resource Refresh Token** section
3. Click **Edit Configuration**
4. Toggle ON the **My Account API**
5. Click **Save**
6. **Log out and log back in** to get a new refresh token with MRRT support

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
   - Region: Pick the closest one to you (AWS, US East recommended)
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

## 6. Get an LLM API Key

### Option A: Groq (Free — recommended for testing)

1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up (no credit card needed)
3. Click **Create API Key**
4. Copy the key → paste as `GROQ_API_KEY`

### Option B: OpenAI (Paid — recommended for final demo)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** → **+ Create new secret key**
4. Copy the key → paste as `OPENAI_API_KEY`

> **Note:** GPT-4o-mini is ~$0.15 per 1M input tokens. $5 of credit lasts a long time.

---

## 7. Set Up Google OAuth (for Gmail via Token Vault)

This creates the Google OAuth credentials that Auth0 needs to access Gmail on behalf of users.

### Step 7a: Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click the project dropdown (top-left) → **New Project**
4. Name: `Second Brain`
5. Click **Create**
6. Make sure the new project is selected in the dropdown

### Step 7b: Enable the Gmail API

1. Go to **APIs & Services** → **Library** (left sidebar)
2. Search for **Gmail API**
3. Click on it → Click **Enable**

### Step 7c: Configure the OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Click **Get Started**
3. **Branding** page:
   - **App name**: `Second Brain`
   - **User support email**: select your email
   - **Audience**: select **External**
   - **Contact information**: your email
   - Click **Save**
4. **Audience** page:
   - User type should be **External** (select if not already)
   - Click **Save**
5. **Data Access** (Scopes) page:
   - Click **Add or Remove Scopes**
   - Search for and check these scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.compose`
   - Click **Update** → **Save**
6. Go to **Audience** → scroll to **Test users** → click **Add Users**
   - Add your own Gmail address
   - Click **Save**

> **Important:** While in "Testing" mode, only the test users you added can authorize. This is fine for the hackathon.

### Step 7d: Create OAuth Client ID Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Auth0 Second Brain`
5. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR_AUTH0_DOMAIN/login/callback
   ```
   (Replace `YOUR_AUTH0_DOMAIN` with your actual Auth0 domain, e.g. `dev-abc123.us.auth0.com`)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret** — you'll need these in the next step

### Step 7e: Configure Google Social Connection in Auth0

1. In Auth0 Dashboard → **Authentication** → **Social**
2. Click **Google / Gmail** (or **Create Connection** → **Google**)
3. Under **Purpose**, select **Authentication and Connected Accounts for Token Vault**
4. Paste the **Client ID** and **Client Secret** from Step 7d
5. Under **Permissions**, check these boxes:
   - ✅ **Offline Access** (needed for Token Vault to refresh tokens)
   - ✅ **Basic Profile** (required, already checked)
   - ✅ **Extended Profile** (required, already checked)
   - ✅ **Gmail.Readonly** (read inbox)
   - ✅ **Gmail.Send** (send emails)
   - ✅ **Calendar** (full calendar access)
   - ✅ **Drive.ReadOnly** (read files from Google Drive)
   - ✅ **Drive.Metadata.ReadOnly** (list/search files in Drive)
   - Leave everything else unchecked
6. Go to the **Applications** tab and enable both:
   - ✅ **Second Brain** (Regular Web App)
   - ✅ **Second Brain AI Agent** (M2M)
7. Click **Save**

---

## 8. Set Up GitHub OAuth (for GitHub Issues via Token Vault)

### Step 8a: Create a GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: `Second Brain`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**:
     ```
     https://YOUR_AUTH0_DOMAIN/login/callback
     ```
     (Same Auth0 domain as above)
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** → copy the **Client Secret**

### Step 8b: Configure GitHub Social Connection in Auth0

1. In Auth0 Dashboard → **Authentication** → **Social**
2. Click **Create Connection** → **GitHub**
3. Purpose: **Authentication and Connected Accounts for Token Vault**
4. Paste the **Client ID** and **Client Secret** from Step 8a
5. Under **Permissions**, check these boxes:
   - ✅ **Basic Profile** (required, already checked)
   - ✅ **Email address**
   - ✅ **read:user** (read profile info)
   - ✅ **repo** (access repos — read issues, post comments)
   - Leave everything else unchecked
6. Go to the **Applications** tab and enable both:
   - ✅ **Second Brain** (Regular Web App)
   - ✅ **Second Brain AI Agent** (M2M)
7. Click **Save**

---

## 9. Set Up Notion OAuth (for Notion Pages via Token Vault)

Like Google and GitHub, Notion connects through Auth0 Token Vault using OAuth.

### Step 9a: Create a Notion Public Integration

1. Go to [notion.so/profile/integrations](https://www.notion.so/profile/integrations)
2. Under **Integrations** (not "Internal integrations"), click **+ New Integration**
3. Fill in **Basic information**:
   - **Integration name**: `Second Brain`
   - **Icon**: Upload any 512×512 image (required)
   - **Associated workspace**: Select your Notion workspace
4. Under **Authorization (OAuth)**, set the **Redirect URI**:
   ```
   https://YOUR_AUTH0_DOMAIN/login/callback
   ```
   (Replace with your actual Auth0 domain, e.g. `dev-abc123.us.auth0.com`)
5. Under **Listing information**, fill in at minimum:
   - **Company name**: Your name
   - **Website**: `http://localhost:3000`
   - **Email**: Your email
   - Leave **Privacy policy URL** and **Terms of use URL** empty (optional for dev)
6. Click **Create**
7. After creation, copy the **OAuth client ID** and **OAuth client secret**

### Step 9b: Configure Notion Social Connection in Auth0

1. In Auth0 Dashboard → **Authentication** → **Social**
2. Click **Create Connection** → search for **Notion**
3. If Notion isn't listed, click **Create Custom**
4. For **Purpose**, select **Authentication and Connected Accounts for Token Vault**
   > Even though users won't log in with Notion, the "Authentication" option must be enabled because Auth0's account-linking flow requires it.
5. Fill in the connection details:
   - **Name**: `notion`
   - **Authorization URL**: `https://api.notion.com/v1/oauth/authorize`
   - **Token URL**: `https://api.notion.com/v1/oauth/token`
   - **Scope**: (leave empty — Notion handles permissions via page selection)
   - **Client ID**: OAuth client ID from Step 9a
   - **Client Secret**: OAuth client secret from Step 9a
6. Go to the **Applications** tab and enable both:
   - ✅ **Second Brain** (Regular Web App)
   - ✅ **Second Brain AI Agent** (M2M)
7. Click **Save**

> **Note:** When users connect Notion via OAuth, they choose which pages to share — Token Vault then stores and refreshes the access token automatically.

---

## Final `.env.local`

After completing all steps, your `.env.local` should look like:

```bash
# Auth0
AUTH0_DOMAIN=dev-abc123.us.auth0.com
AUTH0_CLIENT_ID=aBcDeFgHiJkLmNoPqRsT
AUTH0_CLIENT_SECRET=long-random-secret-from-auth0
AUTH0_SECRET=your-64-char-hex-from-step-1

APP_BASE_URL=http://localhost:3000

# Auth0 M2M (for Token Vault)
AUTH0_AI_CLIENT_ID=m2m-client-id
AUTH0_AI_CLIENT_SECRET=m2m-client-secret

# Database
DATABASE_URL=postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/dbname?sslmode=require

# LLM (use one or the other)
GROQ_API_KEY=gsk_your-groq-api-key
# OPENAI_API_KEY=sk-proj-your-key-here
```

> **Note:** You do NOT need to add Google or GitHub API keys to `.env.local`. Auth0 Token Vault handles those credentials — you configured them in the Auth0 Dashboard's Social Connections.

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
# 7. Try typing "Read my recent emails" → should prompt to connect Google
# 8. Try typing "Show my GitHub issues" → should prompt to connect GitHub
```

If the chat responds and Token Vault prompts appear, everything is wired up correctly! 🎉
