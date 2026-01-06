"use client";

import { useState, useEffect, useRef } from "react";

type Message = { 
  from: "user" | "assistant"; 
  summary?: string; 
  insights?: string; 
  text?: string; 
  timestamp: Date 
};

export default function MobileChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount for mobile
    inputRef.current?.focus();
  }, []);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage: Message = { 
      from: "user", 
      text: input.trim(), 
      timestamp: new Date() 
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, listingId: null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      
      const assistantMessage: Message = { 
        from: "assistant", 
        summary: data.summary,
        insights: data.insights,
        timestamp: new Date() 
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Chat failed";
      setError(message);
      const errorMessage: Message = {
        from: "assistant",
        text: `Sorry, I encountered an error: ${message}`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: "100dvh",
        background: "rgb(var(--background))",
        overflow: "hidden"
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 20px",
          background: "rgb(var(--card))",
          borderBottom: "1px solid rgb(var(--border))",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Ask Your Realtor</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.7 }}>
          Get insights about listings, neighborhoods, and the market
        </p>
      </header>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", opacity: 0.7 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              👋 Welcome!
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              Ask me anything about listings, neighborhoods, or the market.
              <br />
              <br />
              Try: &quot;What neighborhoods are good for families?&quot;
              <br />
              or &quot;Tell me about quiet 2BR listings under $650k&quot;
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.from === "user" ? "flex-end" : "flex-start",
              gap: 8,
              animation: "fadeIn 0.3s ease-in"
            }}
          >
            {msg.from === "user" ? (
              <div
                style={{
                  maxWidth: "85%",
                  padding: "12px 16px",
                  borderRadius: 18,
                  background: "rgb(var(--accent))",
                  color: "rgb(var(--accentFg))",
                  fontSize: 15,
                  wordWrap: "break-word"
                }}
              >
                {msg.text}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8, width: "100%" }}>
                {msg.text && (
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "12px 16px",
                      borderRadius: 18,
                      background: "rgb(var(--card))",
                      color: "rgb(var(--fg))",
                      border: "1px solid rgb(var(--border))",
                      fontSize: 15,
                      lineHeight: 1.5,
                      wordWrap: "break-word"
                    }}
                  >
                    {msg.text}
                  </div>
                )}
                {msg.summary && (
                  <div
                    style={{
                      maxWidth: "90%",
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #e5e7eb",
                      fontSize: 14
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", marginBottom: 4, opacity: 0.6 }}>
                      MLS Summary
                    </div>
                    {msg.summary}
                  </div>
                )}
                {msg.insights && (
                  <div
                    style={{
                      maxWidth: "90%",
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "#ecfdf5",
                      color: "#065f46",
                      border: "1px solid #d1fae5",
                      fontSize: 15
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", marginBottom: 4, opacity: 0.6 }}>
                      Matt Becker Insights
                    </div>
                    {msg.insights}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 18,
                background: "rgb(var(--card))",
                border: "1px solid rgb(var(--border))",
                fontSize: 15
              }}
            >
              <span style={{ opacity: 0.7 }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          background: "rgb(var(--card))",
          borderTop: "1px solid rgb(var(--border))",
          position: "sticky",
          bottom: 0
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 24,
              border: "1px solid rgb(var(--border))",
              background: "rgb(var(--background))",
              fontSize: 15,
              outline: "none"
            }}
          />
          <button
            onClick={() => void sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: loading || !input.trim() ? "rgb(var(--muted))" : "rgb(var(--accent))",
              color: loading || !input.trim() ? "rgb(var(--mutedFg))" : "rgb(var(--accentFg))",
              border: "none",
              fontSize: 20,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            →
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#b91c1c", textAlign: "center" }}>
            {error}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
