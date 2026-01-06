# Real Estate Client Portal

A modern, login-only client portal for realtors that combines live MLS data with AI-powered insights and knowledge management.

## Features

### For Clients
- **Live MLS Search**: Real-time property search powered by Repliers API
- **Mobile Chat** (`/mobile-chat`): Simple, mobile-optimized chat interface to ask questions about listings, neighborhoods, and market trends
- **Listing Details**: Comprehensive property information with MLS facts, Zillow data, and realtor insights
- **Expert Insights**: View your realtor's notes and knowledge on listings, buildings, and neighborhoods

### For Realtors (Admin)
- **Knowledge Management**: Create and manage notes scoped to listings, buildings, neighborhoods, or global
- **Embeddings**: Automatic semantic search powered by OpenAI embeddings and Supabase pgvector
- **Admin Dashboard**: Centralized dashboard to manage all notes and verify embeddings

## Architecture

### Pattern A: Live Query
- **Repliers API**: Live MLS data (no caching)
- **Supabase**: Realtor knowledge layer with embeddings
- **Clerk**: Authentication and org-based access control
- **OpenAI**: Embeddings and chat completion

### Mobile Chat Approach

The mobile chat (`/mobile-chat`) is designed for a seamless client experience:

1. **Browse on Desktop**: Clients view listings on Zillow or other sites
2. **Ask on Mobile**: Use the mobile-optimized chat interface to ask questions
3. **Get Expert Answers**: Receive personalized insights from:
   - **Global embeddings**: General realtor knowledge and market insights
   - **Neighborhood embeddings**: Scoped knowledge about specific neighborhoods
   - **Listing embeddings**: Detailed insights about specific properties

The chat uses RAG (Retrieval-Augmented Generation) to:
- Search embeddings for relevant realtor notes
- Combine MLS facts with realtor insights
- Provide accurate, cited responses

## Setup

### Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# Repliers
REPLIERS_API_URL=https://api.repliers.io
REPLIERS_API_KEY=...

# OpenAI
OPENAI_API_KEY=...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

# Zillow (Optional)
ZILLOW_API_KEY=...
ZILLOW_API_URL=https://api.hasdata.com/v1/zillow
```

### Database Setup

Run the SQL in `supabase/schema_latest.sql` to set up:
- `realtor_notes` table with pgvector support
- Vector similarity search function
- Row-level security policies

### Admin Access

Admin routes (`/admin/*`) are protected and only accessible to:
- Org owners (`org:owner` role)
- Org admins (`org:admin` role)

Regular clients (org members) are automatically redirected to `/listings`.

## Run Locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy

## Key Routes

- `/` - Homepage
- `/listings` - Property search
- `/listings/[id]` - Property details
- `/mobile-chat` - Mobile chat interface
- `/chat` - Desktop chat interface
- `/admin` - Admin dashboard (admin only)
- `/admin/notes` - Manage notes (admin only)
- `/admin/embeddings` - Verify embeddings (admin only)

## Tech Stack

- **Next.js 14** (App Router)
- **Clerk** (Authentication)
- **Supabase** (Postgres + pgvector)
- **Repliers API** (MLS data)
- **Vercel AI SDK** (AI integration - embeddings + chat)
- **OpenAI** (via AI SDK)
- **Zillow API** (Optional property data)

## AI SDK Integration

This project uses the **Vercel AI SDK** (`ai` package) for:
- **Embeddings**: Clean API for creating embeddings via `embed()`
- **Chat Completions**: Better error handling and easier tool integration via `generateText()`
- **Future Tool Calling**: Ready to add tools for dynamic listing search and other features

The AI SDK provides:
- Type-safe APIs
- Better error handling
- Easier integration with Next.js
- Support for streaming (can be added later)
- Tool calling support (ready to enable)
