"use client";

import { useState } from "react";

export default function InquiryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setErrorText("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrorText(json.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("done");
    } catch {
      setErrorText("Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-2xl bg-white p-6 text-center font-semibold text-slate-900">
        Got it. I will reply the same day.
      </p>
    );
  }

  const input =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400";

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-6 max-w-md space-y-3 text-left">
      <input name="name" required placeholder="Your name" className={input} />
      <input name="business" placeholder="Business name" className={input} />
      <input name="phone" placeholder="Phone" className={input} />
      <input name="email" type="email" placeholder="Email" className={input} />
      <textarea
        name="message"
        rows={3}
        placeholder="Anything I should know? (optional)"
        className={input}
      />
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {status === "error" && <p className="text-sm text-red-300">{errorText}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}