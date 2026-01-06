import "server-only";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export async function searchNeighborhoodDetails(neighborhood: string) {
  if (!TAVILY_API_KEY) return null;

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: `latest community events, coffee shops, and restaurant scene in ${neighborhood} neighborhood Chicago`,
        search_depth: "basic",
        include_answer: true,
        max_results: 5
      })
    });

    const data = await res.json();
    return data.answer || data.results?.[0]?.content || null;
  } catch (error) {
    console.error("Tavily search failed:", error);
    return null;
  }
}

