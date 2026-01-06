# Status Report — Findings, Issues, Next Steps

Date: 2025-02-19

## Executive Summary
You now have a Pattern A (live Repliers) MVP with Clerk auth, Supabase notes + embeddings, and a richer Zillow-style listing detail view. Search and detail pages are wired to Repliers, and the advisor + notes flows work against Supabase. There are still a few open integration risks (Repliers field mapping, image URLs, Clerk environment variables, and Supabase RLS bypass when using service role) that should be verified.

## Findings (What’s in Place)

### Auth & Routing
- Clerk middleware protects all routes, with `/sign-in` and `/sign-up` public.
- Server route handlers use `await auth()` to check session context.
- Sign-in and sign-up routes are added for App Router.

### Repliers Integration (Pattern A)
- Server-only Repliers client (no key exposure in the browser).
- Repliers API key uses `REPLIERS-API-KEY` header per docs.
- Status normalization now maps `Active` -> `A`, `Under Contract` -> `U`.
- Search route supports common filters (q, city, price, beds, status).
- Listing detail fetcher handles rich fields and returns a detailed object.

### Listing Detail (Zillow-style)
- Displays:
  - Images grid
  - MLS facts (beds/baths/sqft)
  - Rich details (property type, sub-type, year built, parking, HOA, DOM, lot size)
  - Description
  - Feature tags
  - Raw JSON payload (collapsible)

### Supabase (Notes + Embeddings)
- Schema includes `realtor_notes` with pgvector, tags, and timestamps.
- RPC `match_realtor_notes` for vector similarity search.
- Notes admin page adds notes (with embeddings) and lists recent notes.
- Chat route does embedding + RAG fetch (via RPC) + response composition.

### Docs & Validation
- `references/design_doc.md` updated with correct Clerk middleware usage and Repliers auth.
- `references/validation_checklist.md` added.
- `supabase/schema_latest.sql` and a migration are provided.

## Issues / Risks

### Repliers Field Drift
- Beds/baths/sqft may still show `?` if Repliers uses different field names per MLS or listing type.
- Images may not render if URLs are nested differently; raw JSON view helps inspect.

### Repliers Status / Filter Semantics
- Repliers requires `status` to be `A` or `U` (currently mapped); if you want closed/pending, you must add allowed mappings.

### Clerk Environment Vars
- Ensure both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set.
- Consider setting:
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/listings`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/listings`

### Supabase Security
- Server uses `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS.
- RLS policies are present, but not enforced in server-only flows.
- If you later allow client-side Supabase access, you must integrate Clerk JWT -> Supabase.

### UI / UX
- Search results do not yet show cards with image thumbs or price history.
- Detail page lacks map, contact CTA, and saved/favorite actions.

## Next Steps (Recommended)

### Phase 1 — Stabilize Data Fidelity
1. Capture 3–5 raw Repliers listing payloads and lock field mapping.
2. Adjust field mapping for beds/baths/sqft if Repliers uses alternative keys.
3. Normalize image URLs (some MLS feeds return different media structures).
4. Expand status support (e.g., Pending/Closed) if needed.

### Phase 2 — Zillow-style UI Additions
1. Add image carousel + lightbox on detail page.
2. Add map preview (Mapbox) with listing pin and nearby CTA lines.
3. Add contact CTA section (“Request showing”, “Ask about HOA”).
4. Add “Facts & Features” tables (beds/baths, cooling, heating, tax, HOA).

### Phase 3 — Product Layer
1. Favorites + saved searches (Supabase tables + UI).
2. Search history + notes per client.
3. Advisor structured output (MLS facts vs realtor insight vs follow-up questions).
4. Admin bulk note upload (CSV → chunk → embed → insert).

## Verification Checklist

- `npm run dev` starts without middleware or lint errors.
- `/sign-in` renders Clerk UI.
- `/listings` returns Repliers listings.
- `/listings/[id]` shows photos + extra details.
- `/admin/notes` saves a note; note appears under listing detail.
- `/chat` produces a response and includes realtor notes.

## Open Questions
- Do you want to show closed/pending listings in search?
- Should we restrict the “raw JSON” panel in production builds?
- Do you want to pre-cache Repliers results for faster search (Pattern B)?

## Files Added/Updated (Key Ones)
- `lib/repliers.ts` (Repliers client + normalization)
- `app/listings/page.tsx` (search UI)
- `app/listings/[id]/page.tsx` (detail UI)
- `app/api/repliers/search/route.ts` (Repliers search)
- `app/api/repliers/listing/[id]/route.ts` (detail)
- `app/api/notes/route.ts` (notes CRUD)
- `app/api/chat/route.ts` (advisor)
- `supabase/schema_latest.sql` (DB bootstrap)
- `references/design_doc.md` (updated doc)

