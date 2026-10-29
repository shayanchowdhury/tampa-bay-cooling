"use client";

import { useEffect, useRef, useState } from "react";
import { getBusiness } from "../../lib/businesses";

type Msg = { role: "user" | "assistant"; content: string };

export default function EmbedChat({ businessId }: { businessId: string }) {
  const business = getBusiness(businessId);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!business) {
    return <div className="p-4 text-sm text-slate-600">Chat unavailable.</div>;
  }

  const fallback = `Sorry, something went wrong. Please call us at ${business.phone}.`;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || !business) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, businessId: business.id }),
      });
      const data = await res.json();
      setMessages([
        ...next,
        { role: "assistant", content: data.reply || fallback },
      ]);
    } catch {
      setMessages([...next, { role: "assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900">
      <div className="bg-sky-900 px-4 py-3 text-sm font-semibold text-white">
        Chat with {business.name}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
        <div className="max-w-[85%] rounded-2xl bg-slate-100 px-3 py-2">
          {business.greeting}
        </div>
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl bg-sky-900 px-3 py-2 text-white"
                : "max-w-[85%] rounded-2xl bg-slate-100 px-3 py-2"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="max-w-[85%] rounded-2xl bg-slate-100 px-3 py-2 text-slate-500">
            Typing...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-sky-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-sky-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}