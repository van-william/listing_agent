# Chicago MLS Portal (Demo)

This is a **pitchable demo** of a login-only client portal concept:
- MLS-style listing search + detail pages
- “Advisor” panel that will become tool-calling + RAG later

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this folder to GitHub
2. Import the repo in Vercel
3. Deploy (no env vars required)

## How this becomes real

- Replace `lib/mockListings.ts` with Supabase queries
- Add Clerk org auth + Supabase RLS
- Add ingestion worker (Cron) to pull Chicago MLS updates
- Replace `/api/advisor` with Vercel AI SDK + embeddings in pgvector
