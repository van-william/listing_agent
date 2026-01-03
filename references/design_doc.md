Next.js App Router Setup with Supabase (pgvector) + Clerk (Auth)

MVP (Pattern A) uses Repliers as the live MLS source and Supabase for the realtor knowledge layer (notes + embeddings). Clerk is the only auth source.

1) Project + Auth Setup

Next.js (App Router)
- Use Next 14+ App Router. Interactive components must include "use client".

Environment Variables (.env.local)
- Clerk:
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - CLERK_SECRET_KEY
- Supabase (server-only for PoC):
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - (optional for future client access) NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY
- Repliers (server-only):
  - REPLIERS_API_URL=https://api.repliers.io
  - REPLIERS_API_KEY=... (never expose to client)
- AI (server-only):
  - OPENAI_API_KEY
  - OPENAI_EMBEDDING_MODEL=text-embedding-3-small
  - OPENAI_CHAT_MODEL=gpt-5-mini

Clerk Middleware (protect all routes by default)
```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};
```

Clerk Sign-In/Up routes (App Router)
```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
export default function Page() { return <SignIn />; }

// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
export default function Page() { return <SignUp />; }
```

2) Supabase Schema (Embeddings + Notes)

Enable extensions (Supabase SQL Editor)
```sql
create extension if not exists vector;
create extension if not exists pgcrypto;
```

Notes table (single realtor, global notes for PoC)
```sql
create table if not exists realtor_notes (
  id uuid primary key default gen_random_uuid(),
  org_id text null,
  created_by text null,
  scope text not null default 'global',
  listing_key text null,
  building_key text null,
  neighborhood_key text null,
  content text not null,
  note_vector vector(1536),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists realtor_notes_listing_key_idx on realtor_notes (listing_key);
create index if not exists realtor_notes_building_key_idx on realtor_notes (building_key);
create index if not exists realtor_notes_neighborhood_key_idx on realtor_notes (neighborhood_key);
```

Vector search index (use after some rows exist)
```sql
create index if not exists realtor_notes_embedding_idx
  on realtor_notes using ivfflat (note_vector vector_cosine_ops)
  with (lists = 100);
```

RLS (future-ready; server-only PoC uses service role key)
```sql
alter table realtor_notes enable row level security;

create policy "notes_read_authenticated" on realtor_notes
  for select using (auth.role() = 'authenticated');

create policy "notes_write_authenticated" on realtor_notes
  for insert with check (auth.role() = 'authenticated');
```

Note: With Clerk-only auth and a server-side Supabase client (service role), RLS is bypassed. When you later enable client-side Supabase access, add Clerk JWT integration so auth.role() works.

3) Vector RPC (Correct Supabase pgvector usage)

Supabase JS does not support ordering on vector columns directly. Use an RPC:
```sql
create or replace function match_realtor_notes(
  query_embedding vector(1536),
  match_keys text[] default null,
  match_count int default 6
)
returns table (
  id uuid,
  content text,
  listing_key text,
  building_key text,
  neighborhood_key text,
  similarity float
)
language sql stable as $$
  select
    id,
    content,
    listing_key,
    building_key,
    neighborhood_key,
    1 - (note_vector <=> query_embedding) as similarity
  from realtor_notes
  where note_vector is not null
    and (
      match_keys is null
      or listing_key = any(match_keys)
      or building_key = any(match_keys)
      or neighborhood_key = any(match_keys)
    )
  order by note_vector <=> query_embedding
  limit match_count;
$$;
```

4) Listings Search (Repliers)

Server route handler (never expose Repliers key). Repliers expects `REPLIERS-API-KEY` header:
```ts
// app/api/repliers/search/route.ts
import { NextResponse } from "next/server";
import { searchListings } from "@/lib/repliers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const result = await searchListings({
    q: searchParams.get("q") || "",
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    minBeds: searchParams.get("minBeds"),
    city: searchParams.get("city") || "Chicago"
  });
  return NextResponse.json(result);
}
```

5) Listing Detail (MLS facts + realtor notes)

Server component fetches the listing and related knowledge:
- Listing from Repliers (facts)
- Notes from Supabase (guidance)

6) Chat Advisor (RAG)

Flow:
1. Create embedding for user query (OPENAI_EMBEDDING_MODEL).
2. Call match_realtor_notes RPC with listing/building/neighborhood keys.
3. Call chat model with clear sections: "MLS facts" vs "Realtor notes".

Important: Always label MLS data vs realtor insights to avoid mixing facts and opinions.

7) Recap
- Pattern A keeps Repliers as the live facts source.
- Supabase stores the realtor knowledge layer + embeddings.
- Clerk protects all routes and gives user identity for server-side auth checks.
