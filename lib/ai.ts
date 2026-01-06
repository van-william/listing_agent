import "server-only";
import { openai } from "@ai-sdk/openai";
import { embed, generateText } from "ai";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

/**
 * Create embedding using AI SDK
 */
export async function createEmbedding(input: string) {
  const model = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
  
  // Ensure API key is set
  getRequiredEnv("OPENAI_API_KEY");
  
  const { embedding } = await embed({
    model: openai.embedding(model),
    value: input
  });

  return embedding;
}

/**
 * Generate chat completion using AI SDK
 * Better error handling and easier to extend with tools later
 */
export async function createChatCompletion(params: {
  messages: Array<{ role: "system" | "assistant" | "user"; content: string }>;
  tools?: any;
  maxSteps?: number;
}) {
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
  
  // Ensure API key is set
  getRequiredEnv("OPENAI_API_KEY");

  const { text } = await generateText({
    model: openai(model),
    messages: params.messages,
    tools: params.tools,
    maxSteps: params.maxSteps || 5, // Allow the model to call tools multiple times
    temperature: 0.2
  });

  return text;
}
