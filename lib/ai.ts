import "server-only";

type ChatMessage = { role: "system" | "assistant" | "user"; content: string };

const OPENAI_URL = "https://api.openai.com/v1";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function createEmbedding(input: string) {
  const apiKey = getRequiredEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

  const res = await fetch(`${OPENAI_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, input })
  });

  if (!res.ok) {
    throw new Error(`OpenAI embedding failed (${res.status})`);
  }

  const payload = (await res.json()) as { data?: Array<{ embedding: number[] }> };
  const embedding = payload.data?.[0]?.embedding;
  if (!embedding) throw new Error("OpenAI embedding missing");
  return embedding;
}

export async function createChatCompletion(messages: ChatMessage[]) {
  const apiKey = getRequiredEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

  const res = await fetch(`${OPENAI_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages, temperature: 0.2 })
  });

  if (!res.ok) {
    throw new Error(`OpenAI chat failed (${res.status})`);
  }

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI chat missing response");
  return content;
}
