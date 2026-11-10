import { NextResponse } from "next/server";
import { getAdmin } from "../../../lib/supabase-admin";
import { makeSlug } from "../../../lib/slug";

const hits = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 3;
}

function clean(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (tooMany(ip)) {
      return NextResponse.json({ error: "Too many tries. Wait a minute." }, { status: 429 });
    }

    const body = await req.json();

    // honeypot: bots fill this, people never see it
    if (clean(body.website, 100)) {
      return NextResponse.json({ ok: true });
    }

    const name = clean(body.name, 80);
    const city = clean(body.city, 60);
    const industry = clean(body.industry, 40);
    const phone = clean(body.phone, 30);
    const hours = clean(body.hours, 120);
    const services = clean(body.services, 300);
    const notifyEmail = clean(body.notifyEmail, 120);

    if (!name || !city || !phone || !services || !notifyEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please fill in name, city, phone, services, and a valid email." },
        { status: 400 }
      );
    }

    const slug = makeSlug(name);

    const { error } = await getAdmin().from("businesses").insert({
      slug,
      name,
      city,
      industry: industry || "home services",
      phone,
      hours: hours || "Mon-Fri 8am-5pm",
      services,
      greeting: `Hi! Thanks for reaching out to ${name}. How can I help you today?`,
      notes: "",
      notify_email: notifyEmail,
      demo: true,
    });

    if (error) {
      console.error("Start insert error:", error);
      return NextResponse.json({ error: "Could not save. Try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error("Start route error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}