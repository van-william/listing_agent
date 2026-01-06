import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createEmbedding, createChatCompletion } from "@/lib/ai";
import { matchNotesByEmbedding } from "@/lib/notes";
import { buildMatchKeys } from "@/lib/keys";
import { getListingById, searchListings } from "@/lib/repliers";
import { searchNeighborhoodDetails } from "@/lib/tavily";
import { z } from "zod";
import { tool } from "ai";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const listingId = body.listingId ? String(body.listingId) : null;
  const buildingAddress = body.buildingAddress ? String(body.buildingAddress) : null;
  const neighborhood = body.neighborhood ? String(body.neighborhood) : null;

  try {
    // 1. Initial RAG fetch (Realtor Knowledge)
    const embedding = await createEmbedding(message);
    const keys = buildMatchKeys({ listingId, buildingAddress, neighborhood });

    const [notes, listing] = await Promise.all([
      matchNotesByEmbedding({ embedding, keys, limit: 6 }),
      listingId ? getListingById(listingId).catch(() => null) : Promise.resolve(null),
    ]);

    // 2. Define Tools for dynamic fetching
    const tools = {
      searchLiveListings: tool({
        description: "Search live MLS listings based on user criteria like price, beds, city.",
        parameters: z.object({
          q: z.string().describe("Search query, e.g., neighborhood name, address, or specific keywords"),
          city: z.string().describe("The city to search in"),
          minPrice: z.number().describe("Minimum price in dollars"),
          maxPrice: z.number().describe("Maximum price in dollars"),
          minBeds: z.number().describe("Minimum number of bedrooms"),
        }).partial(), // Use .partial() to make all fields optional while keeping the object type
        execute: async (params) => {
          return await searchListings({
            q: params.q,
            city: params.city,
            minPrice: params.minPrice?.toString(),
            maxPrice: params.maxPrice?.toString(),
            minBeds: params.minBeds?.toString(),
          });
        }
      }),
      searchWebKnowledge: tool({
        description: "Search the web for real-time community information, neighborhood vibe, or local amenities using Tavily.",
        parameters: z.object({
          query: z.string().describe("The search query for local neighborhood info")
        }),
        execute: async ({ query }) => {
          return await searchNeighborhoodDetails(query);
        }
      })
    };

    const realtorTribalKnowledge = notes.length 
      ? notes.map(n => n.content).join("\n") 
      : "No specific realtor notes found.";

    const prompt = [
      {
        role: "system",
        content: `You are a real estate advisor. You MUST respond in a strict JSON format.
        
        The JSON structure MUST be:
        {
          "summary": "A factual, concise recap of the MLS data or live web facts.",
          "insights": "Your personalized advice and guidance based ONLY on the REALTOR TRIBAL KNOWLEDGE provided."
        }
        
        Style: Professional, encouraging, and specific.
        CRITICAL: Do not include markdown code blocks. Return only the raw JSON object.`
      },
      { 
        role: "user", 
        content: `
        REALTOR TRIBAL KNOWLEDGE (MATT BECKER):
        ${realtorTribalKnowledge}
        
        CURRENT MLS LISTING CONTEXT:
        ${listing ? JSON.stringify(listing) : "No specific listing selected."}
        
        USER QUESTION: ${message}`
      }
    ];

    const responseText = await createChatCompletion({ 
      messages: prompt as Array<{ role: "system" | "assistant" | "user"; content: string }>,
      tools: tools as any, // Cast to any to avoid complex AI SDK type issues between files
      maxSteps: 5
    });
    
    // Clean and Parse JSON with enhanced fallback
    let structuredResponse;
    try {
      // 1. Aggressive cleaning (remove markdown and everything outside first { and last })
      const cleaned = responseText.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const jsonToParse = jsonMatch ? jsonMatch[0] : cleaned;
      
      structuredResponse = JSON.parse(jsonToParse);
    } catch (e) {
      console.warn("JSON Parse Failed, using smart fallback logic.");
      
      // 2. Smart Fallback: If it's not JSON, assume the AI just gave a natural response.
      // We'll put the whole response in insights and create a factual summary from our context.
      structuredResponse = { 
        summary: listing 
          ? `Listing at ${listing.address} ($${listing.price?.toLocaleString()}). ${listing.beds}bd/${listing.baths}ba.`
          : "Factual property data retrieved.", 
        insights: responseText 
      };
    }

    return NextResponse.json({ 
      summary: structuredResponse.summary,
      insights: structuredResponse.insights,
      notes, 
      listing 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
