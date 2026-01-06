import "server-only";
import type { RealtorNoteSummary } from "@/lib/types";
import { buildMatchKeys } from "@/lib/keys";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NoteScope = "global" | "listing" | "building" | "neighborhood";

export type CreateNoteInput = {
  scope: NoteScope;
  content: string;
  tags?: string[];
  listingId?: string | null;
  buildingAddress?: string | null;
  neighborhood?: string | null;
  createdBy?: string | null;
  orgId?: string | null;
  embedding?: number[] | null;
};

function buildKeyFilters(keys: string[]) {
  const filters: string[] = ["scope.eq.global"];
  if (keys.length > 0) {
    const list = keys.join(",");
    filters.push(`listing_key.in.(${list})`);
    filters.push(`building_key.in.(${list})`);
    filters.push(`neighborhood_key.in.(${list})`);
  }
  return filters.join(",");
}

export async function fetchNotesByKeys(keys: string[], limit = 8) {
  const supabase = createSupabaseServerClient();
  const orFilters = buildKeyFilters(keys);

  const { data, error } = await supabase
    .from("realtor_notes")
    .select("id, scope, content, listing_key, building_key, neighborhood_key, tags, created_at")
    .or(orFilters)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []) as RealtorNoteSummary[];
}

export async function fetchAllNotes(limit = 50) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("realtor_notes")
    .select("id, scope, content, listing_key, building_key, neighborhood_key, tags, created_at, note_vector")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []).map((note) => ({
    ...note,
    has_embedding: note.note_vector != null
  })) as Array<RealtorNoteSummary & { has_embedding?: boolean }>;
}

export async function insertNote(input: CreateNoteInput) {
  const supabase = createSupabaseServerClient();
  const keys = buildMatchKeys({
    listingId: input.listingId || undefined,
    buildingAddress: input.buildingAddress || undefined,
    neighborhood: input.neighborhood || undefined
  });

  const listingKey = keys.find((k) => k.startsWith("mred:")) || null;
  const buildingKey = keys.find((k) => k.startsWith("building:")) || null;
  const neighborhoodKey = keys.find((k) => k.startsWith("neighborhood:")) || null;

  const payload = {
    scope: input.scope,
    content: input.content,
    tags: input.tags ?? [],
    listing_key: listingKey,
    building_key: buildingKey,
    neighborhood_key: neighborhoodKey,
    created_by: input.createdBy ?? null,
    org_id: input.orgId ?? null,
    note_vector: input.embedding ?? null
  };

  const { data, error } = await supabase
    .from("realtor_notes")
    .insert(payload)
    .select("id, scope, content, listing_key, building_key, neighborhood_key, tags, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as RealtorNoteSummary;
}

export async function matchNotesByEmbedding(input: {
  embedding: number[];
  keys: string[];
  limit?: number;
}) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("match_realtor_notes", {
    query_embedding: input.embedding,
    match_keys: input.keys.length ? input.keys : null,
    match_count: input.limit ?? 6
  });

  if (error) throw new Error(error.message);
  return (data || []) as Array<{
    id: string;
    content: string;
    listing_key: string | null;
    building_key: string | null;
    neighborhood_key: string | null;
    similarity: number;
  }>;
}
