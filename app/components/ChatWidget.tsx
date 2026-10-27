"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { getBusiness } from "../../lib/businesses";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatWidget({ businessId }: { businessId?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  const business = getBusiness(businessId);
  if (!business) return null;

  const fallback = `Sorry, something went wrong. Please call us at ${business.phone}.`;

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next: Message[] = [...messages, { role: "user", content: text }];
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
      const reply = res.ok && typeof data.reply === "string" ? data.reply : fallback;
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-96 w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-sky-800 px-4 py-3 text-sm font-semibold text-white">
            Chat with {business.name}
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            <div className="max-w-[85%] rounded-xl bg-slate-100 px-3 py-2 text-slate-800">
              {business.greeting}
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-xl bg-sky-800 px-3 py-2 text-white"
                    : "max-w-[85%] rounded-xl bg-slate-100 px-3 py-2 text-slate-800"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && <div className="text-slate-500">Typing...</div>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              maxLength={500}
              className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-800"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-sky-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full bg-sky-800 px-5 py-3 text-sm font-semibold text-white shadow-lg"
      >
        {open ? "Close" : "Chat"}
      </button>
    </div>
  );
}