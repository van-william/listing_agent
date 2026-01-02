"use client";

import { useState } from "react";

type ChatBoxProps = {
  listingId: string;
};

export default function ChatBox({ listingId }: ChatBoxProps) {
  const [input, setInput] = useState("What should I watch out for here?");
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <form
        action={"#"}
        onSubmit={async (e) => {
          e.preventDefault();
          setIsLoading(true);
          setOutput("Thinking...");
          try {
            const res = await fetch("/api/advisor", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ listingId, message: input })
            });
            const data = await res.json();
            setOutput(data.answer ?? "No response.");
          } catch {
            setOutput("Something went wrong.");
          } finally {
            setIsLoading(false);
          }
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #eaeaea" }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            background: "#111",
            color: "white",
            border: "none",
            fontWeight: 800,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          Ask
        </button>
      </form>
      <pre
        style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 12,
          background: "#fafafa",
          border: "1px solid #eee",
          whiteSpace: "pre-wrap",
          fontSize: 12.5,
          lineHeight: 1.5
        }}
      >
        {output || "(response will appear here)"}
      </pre>
    </div>
  );
}
