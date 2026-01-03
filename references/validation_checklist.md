Validation Checklist (MVP)

Database
- Run `supabase/schema_latest.sql` in the Supabase SQL Editor.
- Confirm `realtor_notes` table exists and `match_realtor_notes` RPC is available.

Environment
- Verify `.env.local` includes: REPLIERS_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, Clerk keys.
- Add REPLIERS_API_URL if not set (defaults to https://api.repliers.io).

App Flow
- Sign in via `/sign-in`.
- Visit `/listings`, run a search, and open a listing detail page.
- Visit `/admin/notes`, create a note, then confirm it appears on listing detail (if scoped).
- Visit `/chat`, ask a question, and verify the response separates MLS facts vs realtor notes.

Observability
- If any route errors, check the server logs for missing env vars or Supabase RPC errors.
