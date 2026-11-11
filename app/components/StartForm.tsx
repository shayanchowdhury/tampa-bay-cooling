"use client";

import { FormEvent, useState } from "react";

type Result = { slug: string; origin: string };

export default function StartForm() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("plumbing");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [services, setServices] = useState("");
  const [notes, setNotes] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-sky-800";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          industry,
          phone,
          hours,
          services,
          notes,
          notifyEmail,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.slug) {
        setError(data.error || "Something went wrong. Try again.");
      } else {
        setResult({ slug: data.slug, origin: window.location.origin });
      }
    } catch {
      setError("Network problem. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const demoUrl = `${result.origin}/demo/${result.slug}`;
    const snippet = `<script src="${result.origin}/widget.js" data-business="${result.slug}"></script>`;
    return (
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900">
        <h2 className="text-2xl font-bold">Your assistant is ready.</h2>
        <div>
          <p className="text-sm font-semibold text-slate-600">1. Try it right now</p>
          <a
            href={demoUrl}
            className="break-all text-sky-800 underline"
            target="_blank"
            rel="noreferrer"
          >
            {demoUrl}
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">
            2. Put it on your website: paste this before the closing body tag
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-800">
            {snippet}
          </pre>
        </div>
        <p className="text-sm text-slate-600">
          Leads and booking requests will be emailed to {notifyEmail}.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900"
    >
      <div>
        <label className="mb-1 block text-sm font-semibold">Business name</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">City</label>
          <input
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={60}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Trade</label>
          <select
            className={inputClass}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="plumbing">Plumbing</option>
            <option value="HVAC">HVAC</option>
            <option value="electrical">Electrical</option>
            <option value="home services">Other home service</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Business phone</label>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Hours</label>
          <input
            className={inputClass}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Mon-Fri 8am-5pm"
            maxLength={120}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">
          Services (separate with commas)
        </label>
        <input
          className={inputClass}
          value={services}
          onChange={(e) => setServices(e.target.value)}
          placeholder="Leak repair, Water heaters, Drain cleaning"
          maxLength={300}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">
          Anything customers should know? (optional)
        </label>
        <textarea
          className={inputClass}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Service area, price ranges, emergency policy, licensed and insured..."
          rows={4}
          maxLength={600}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">
          Email for new leads
        </label>
        <input
          type="email"
          className={inputClass}
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          maxLength={120}
          required
        />
      </div>

      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-sky-800 px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Building your assistant..." : "Build my assistant"}
      </button>
    </form>
  );
}