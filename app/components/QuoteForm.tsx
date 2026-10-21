"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../../lib/supabase";

const SERVICE_OPTIONS = ["AC Repair", "Installation", "Maintenance"] as const;

type Status = "idle" | "loading" | "success" | "error";

export default function QuoteForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState<(typeof SERVICE_OPTIONS)[number] | "">(
    "",
  );
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    const { error } = await supabase.from("quotes").insert({
      name: trimmedName,
      phone: trimmedPhone,
      service,
      message: trimmedMessage || null,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      return;
    }

    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          service,
          message: trimmedMessage,
        }),
      });
    } catch {
      // Quote is already saved; email failure should not block success.
    }

    setStatus("success");
    setName("");
    setPhone("");
    setService("");
    setMessage("");
  }

  return (
    <form
      id="quote-form"
      onSubmit={handleSubmit}
      className="mt-2 w-full max-w-xl space-y-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="quote-name" className="text-sm font-medium text-sky-50">
          Name
        </label>
        <input
          id="quote-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === "loading"}
          className="h-12 w-full rounded-xl border border-sky-600 bg-white px-4 text-base text-slate-900 outline-none ring-sky-300 placeholder:text-slate-400 focus:ring-2 disabled:opacity-60"
          placeholder="Your name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="quote-phone" className="text-sm font-medium text-sky-50">
          Phone
        </label>
        <input
          id="quote-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={status === "loading"}
          className="h-12 w-full rounded-xl border border-sky-600 bg-white px-4 text-base text-slate-900 outline-none ring-sky-300 placeholder:text-slate-400 focus:ring-2 disabled:opacity-60"
          placeholder="(813) 555-0148"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="quote-service"
          className="text-sm font-medium text-sky-50"
        >
          Service
        </label>
        <select
          id="quote-service"
          name="service"
          required
          value={service}
          onChange={(e) =>
            setService(e.target.value as (typeof SERVICE_OPTIONS)[number] | "")
          }
          disabled={status === "loading"}
          className="h-12 w-full rounded-xl border border-sky-600 bg-white px-4 text-base text-slate-900 outline-none ring-sky-300 focus:ring-2 disabled:opacity-60"
        >
          <option value="" disabled>
            Select a service
          </option>
          {SERVICE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="quote-message"
          className="text-sm font-medium text-sky-50"
        >
          Message <span className="font-normal text-sky-200">(optional)</span>
        </label>
        <textarea
          id="quote-message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "loading"}
          className="w-full resize-y rounded-xl border border-sky-600 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-sky-300 placeholder:text-slate-400 focus:ring-2 disabled:opacity-60"
          placeholder="Anything we should know before we call?"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-sky-900 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "loading" ? "Sending…" : "Request free quote"}
      </button>

      {status === "success" && (
        <p
          role="status"
          className="rounded-xl bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-100"
        >
          Thanks — we got your request and will call you back soon.
        </p>
      )}

      {status === "error" && (
        <p
          role="alert"
          className="rounded-xl bg-red-500/20 px-4 py-3 text-sm font-medium text-red-100"
        >
          {errorMessage}
        </p>
      )}
    </form>
  );
}
