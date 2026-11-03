import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "../../../lib/supabase";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function tooManyRequests(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > MAX_PER_WINDOW;
}

function clean(value: unknown, max: number): string {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (tooManyRequests(ip)) {
        return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Honeypot: real visitors never fill this hidden field.
    if (clean(body.website, 200)) {
        return NextResponse.json({ ok: true });
    }

    const name = clean(body.name, 100);
    const business = clean(body.business, 150);
    const phone = clean(body.phone, 30);
    const email = clean(body.email, 150);
    const message = clean(body.message, 1000);

    if (!name || (!phone && !email)) {
        return NextResponse.json({ error: "Add your name and a phone or email." }, { status: 400 });
    }

    const { error } = await supabase
        .from("inquiries")
        .insert({ name, business, phone, email, message });
    if (error) {
        console.error("Inquiry save error:", error.message);
        return NextResponse.json({ error: "Could not send. Please email me instead." }, { status: 500 });
    }

    try {
        const apiKey = process.env.RESEND_API_KEY;
        const notifyEmail = process.env.NOTIFY_EMAIL;
        if (apiKey && notifyEmail) {
            const resend = new Resend(apiKey);
            const { error: emailError } = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: notifyEmail,
                subject: `New inquiry: ${business || name}`,
                text: [
                    `Name: ${name}`,
                    `Business: ${business || "(none)"}`,
                    `Phone: ${phone || "(none)"}`,
                    `Email: ${email || "(none)"}`,
                    `Message: ${message || "(none)"}`,
                    "Source: ai-chat landing page",
                ].join("\n"),
            });
            if (emailError) console.error("Inquiry email error:", emailError.message);
        }
    } catch {
        console.error("Inquiry email failed");
    }

    return NextResponse.json({ ok: true });
}