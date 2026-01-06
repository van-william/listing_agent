# AGENTS.md — Chicago Client Portal (Repliers + Supabase + Clerk) MVP

## Purpose
Build a **login-only client portal** for a Chicago realtor (MRED via Repliers) that:
- lets clients **search listings** (live via Repliers — Pattern A),
- shows **listing detail pages**,
- adds **realtor tribal knowledge** (notes + embeddings) alongside MLS facts,
- provides a **chat advisor** that retrieves realtor knowledge (RAG) and never invents listing facts.

**Core principle:** *Listings = facts* (from Repliers/MLS). *Knowledge = guidance/opinion* (from realtor). Always label and separate them.

---

## Architecture Summary (Pattern A)
**Repliers**
- canonical listing facts
- live search + listing detail

**Supabase (Postgres + PostGIS + pgvector)**
- realtor notes + embeddings
- client context (favorites, saved searches, chat history)
- audit logs
- strict row-level security (RLS) enforced by org membership

**Clerk**
- authentication + org memberships
- the realtor is Org owner; clients are org members

**Next.js (App Router) on Vercel**
- server components for pages
- route handlers for API calls (/api/repliers/*, /api/chat, /api/notes)
- scheduled jobs later (optional) for alerts and ingestion (Pattern B/C)

---

## MVP Features
### Must-have (Phase 1)
1) **Auth gating**
- Clerk auth required for all app routes (except landing)
- org membership required to access listings/notes/chat

2) **Listings search**
- `/listings`: search UI (filters + map optional)
- calls Repliers via a server-side route handler (never expose Repliers key to client)

3) **Listing detail**
- `/listings/[id]`: fetch listing facts from Repliers
- fetch related realtor knowledge from Supabase:
  - direct notes: listing/building/neighborhood
  - optional semantic notes: embeddings search

4) **Knowledge admin (simple)**
- `/admin/notes`: create/edit notes (scope + tags)
- on save: chunk + embed + store

5) **Chat advisor**
- `/chat`: user asks questions (“quiet 2BR near Brown Line < $650k”)
- agent uses tools:
  - `searchListings(filters)` -> Repliers
  - `getListing(id)` -> Repliers
  - `getKnowledgeContext(keys, query)` -> Supabase (direct + semantic)
- response format:
  - MLS facts (cited)
  - Realtor notes (cited)
  - Follow-up questions

---

## Keys / Joining Strategy (critical)
We attach knowledge at 3 levels using stable keys:

### Listing-level key
- `listing_key = "mred:" + listing_id` (or `repliers:` + id)

### Building-level key
- derived from listing address
- **building_key excludes unit**
  - e.g. `"building:2330_n_clark_st_chicago_il_60614"`

### Neighborhood-level key
- `neighborhood_key = "neighborhood:" + slug`
  - e.g. `"neighborhood:lincoln-park"`

**Rule:** Building key is generated via normalization, never user-entered. Unit-level notes are optional later.

---

## Repos / Dependencies
- Next.js (App Router)
- Clerk (`@clerk/nextjs`)
- Supabase (`@supabase/supabase-js`)
- OpenAI (embeddings + chat) or compatible provider
- (optional later) map provider (Mapbox/Google)

---

## Environment Variables
### Clerk
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client, limited)

### Repliers
- `REPLIERS_API_URL` (server-only)
- `REPLIERS_API_KEY` (server-only)

### Zillow (Optional)
- `ZILLOW_API_KEY` (server-only, optional - graceful degradation if not set)
- `ZILLOW_API_URL` (server-only, defaults to HasData API)

### AI
- `OPENAI_API_KEY` (server-only)
- `OPENAI_EMBEDDING_MODEL` (e.g., `text-embedding-3-small`)
- `OPENAI_CHAT_MODEL` (e.g., `gpt-5-mini`)

---

## Supabase Schema (Bootstrapping SQL)
> Run in Supabase SQL editor. Requires `vector` extension.

### Extensions
```sql
create extension if not exists vector;
create extension if not exists pgcrypto;
