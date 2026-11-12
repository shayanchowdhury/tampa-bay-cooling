import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "../../../lib/supabase";
import type { BusinessConfig } from "../../../lib/businesses";
import { getBusinessAsync } from "../../../lib/business-store";

const client = new Anthropic();

const MODEL = "claude-haiku-5-5";

const OTHER_SERVICE = "Other / not sure";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function tooManyRequests(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > MAX_PER_WINDOW;
}

function allowedServices(b: BusinessConfig): string[] {
    return [...b.services, OTHER_SERVICE];
}

function buildSystemPrompt(b: BusinessConfig): string {
    return [
        `You are the website assistant for ${b.name}, a ${b.industry} business in ${b.city}.${b.demo ? " This is a demo." : ""}`,
        `Help visitors with questions about these services: ${b.services.join(", ")}.`,
        `If a request is plausibly part of this trade but doesn't match a listed service exactly (for example a dripping faucet when the list says leak repair), do not turn the visitor away. Use the service "${OTHER_SERVICE}" and describe the request in the message field. Only decline requests that clearly belong to a different trade.`,
        `Business phone: ${b.phone}. ${b.hours}`,
        b.notes,
        "Never invent prices, availability, or promises. If you don't know something, say someone from the team will follow up.",
        "When someone wants a quote or service, ask for their name, phone number, and which service they need, one question at a time. Don't ask them to re-confirm details they already gave.",
        "Once you have all three, call the save_lead tool exactly once. Never call it before you have all three. If the visitor was already told someone will follow up, don't call it again unless they give new details.",
        "When you call save_lead, also set score and summary. score is hot if the visitor needs service urgently or soon (emergency, leak, no AC or heat, wants someone today or this week), warm if they are interested but vague or only asking about price, and cold if the request is unclear or looks like spam. summary is one plain sentence describing what they need.",
        "If the visitor wants to book or schedule an appointment, ask for their name, phone number, which service they need, and the day and time they prefer, one question at a time. Once you have all four, call the book_appointment tool exactly once. Use save_lead instead when they only want a quote or have a question.",
        "A booking is a request, not a confirmed slot. After book_appointment succeeds, tell them the team will call to confirm the time. Never say the appointment is confirmed.",
        "After a tool succeeds, tell them someone will follow up, without promising a specific time.",
        "Keep every reply under three short sentences.",
    ].join("\n");
}

function buildTools(b: BusinessConfig): Anthropic.Tool[] {
    return [
        {
            name: "save_lead",
            description: "Save a customer's contact details so the business can follow up.",
            input_schema: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    phone: { type: "string" },
                    service: { type: "string", enum: allowedServices(b) },
                    message: {
                        type: "string",
                        description:
                            "Short note about the request. Required when service is Other / not sure.",
                    },
                    score: { type: "string", enum: ["hot", "warm", "cold"] },
                    summary: { type: "string", description: "One sentence describing what the customer needs." },
                },
                required: ["name", "phone", "service", "score", "summary"],
            },
        },
        {
            name: "book_appointment",
            description:
                "Record an appointment request. The team will call the customer to confirm the time.",
            input_schema: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    phone: { type: "string" },
                    service: { type: "string", enum: allowedServices(b) },
                    preferred_time: {
                        type: "string",
                        description: "The day and time the customer wants, in their own words.",
                    },
                    notes: {
                        type: "string",
                        description:
                            "Short note about the visit. Required when service is Other / not sure.",
                    },
                },
                required: ["name", "phone", "service", "preferred_time"],
            },
        },
    ];
}

type ChatMessage = { role: "user" | "assistant"; content: string };

async function notifyOwner(b: BusinessConfig, subject: string, lines: string[]) {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const notifyEmail = b.notifyEmail || process.env.NOTIFY_EMAIL;
        if (apiKey && notifyEmail) {
            const resend = new Resend(apiKey);
            const { error: emailError } = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: notifyEmail,
                subject,
                text: lines.join("\n"),
            });
            if (emailError) console.error("Email error:", emailError.message);
        }
    } catch {
        console.error("Email failed");
    }
}

async function saveLead(input: unknown, b: BusinessConfig): Promise<string> {
    const data = (input ?? {}) as Record<string, unknown>;
    const name = typeof data.name === "string" ? data.name.trim().slice(0, 100) : "";
    const phone = typeof data.phone === "string" ? data.phone.trim().slice(0, 30) : "";
    const service = typeof data.service === "string" ? data.service : "";
    const note = typeof data.message === "string" ? data.message.trim().slice(0, 500) : "";
    const rawScore = typeof data.score === "string" ? data.score.toLowerCase() : "";
    const score = ["hot", "warm", "cold"].includes(rawScore) ? rawScore : "warm";
    const summary = typeof data.summary === "string" ? data.summary.trim().slice(0, 300) : "";

    if (!name || !phone || !allowedServices(b).includes(service)) {
        return "Missing or invalid details. Ask the visitor for what is missing.";
    }

    const tag = `[chat: ${b.name}] [${score}]`;
    const { error } = await supabase.from("quotes").insert({
        name,
        phone,
        service,
        message: note ? `${tag} ${note}` : tag,
    });
    if (error) {
        console.error("Lead save error:", error.message);
        return "Could not save the lead. Tell the visitor to call the business instead.";
    }

    await notifyOwner(b, `New ${score.toUpperCase()} chat lead (${b.name}): ${service}`, [
        `Business: ${b.name}`,
        `Score: ${score.toUpperCase()}`,
        `Summary: ${summary || "(none)"}`,
        "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Service: ${service}`,
        `Message: ${note || "(none)"}`,
        "Source: website chat",
    ]);

    return "Lead saved. Tell the visitor someone will follow up.";
}

async function saveBooking(input: unknown, b: BusinessConfig): Promise<string> {
    const data = (input ?? {}) as Record<string, unknown>;
    const name = typeof data.name === "string" ? data.name.trim().slice(0, 100) : "";
    const phone = typeof data.phone === "string" ? data.phone.trim().slice(0, 30) : "";
    const service = typeof data.service === "string" ? data.service : "";
    const preferredTime =
        typeof data.preferred_time === "string" ? data.preferred_time.trim().slice(0, 100) : "";
    const note = typeof data.notes === "string" ? data.notes.trim().slice(0, 500) : "";

    if (!name || !phone || !preferredTime || !allowedServices(b).includes(service)) {
        return "Missing or invalid details. Ask the visitor for what is missing.";
    }

    const { error } = await supabase.from("bookings").insert({
        business_id: b.id,
        name,
        phone,
        service,
        preferred_time: preferredTime,
        notes: note || null,
    });
    if (error) {
        console.error("Booking save error:", error.message);
        return "Could not save the booking. Tell the visitor to call the business instead.";
    }

    await notifyOwner(b, `New BOOKING request (${b.name}): ${service}, ${preferredTime}`, [
        `Business: ${b.name}`,
        `Preferred time: ${preferredTime}`,
        "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Service: ${service}`,
        `Notes: ${note || "(none)"}`,
        "Source: website chat",
        "",
        "Call the customer to confirm the time.",
    ]);

    return "Booking request saved. Tell the visitor the team will call to confirm the time. Do not say it is confirmed.";
}

export async function POST(request: Request) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (tooManyRequests(ip)) {
        return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: "Agent is not configured." }, { status: 500 });
    }

    let body: { messages?: { role?: string; content?: unknown }[]; businessId?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const business = await getBusinessAsync(body.businessId);
    if (!business) {
        return NextResponse.json({ error: "Unknown business." }, { status: 400 });
    }

    const messages: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : [])
        .filter(
            (m) =>
                (m.role === "user" || m.role === "assistant") &&
                typeof m.content === "string" &&
                m.content.trim().length > 0
        )
        .slice(-12)
        .map((m) => ({
            role: m.role as "user" | "assistant",
            content: (m.content as string).slice(0, 1000),
        }));

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
        return NextResponse.json({ error: "Send a user message." }, { status: 400 });
    }

    const system = buildSystemPrompt(business);
    const tools = buildTools(business);

    try {
        let convo: Anthropic.MessageParam[] = messages;
        let response = await client.messages.create({
            model: MODEL,
            max_tokens: 400,
            system,
            tools,
            messages: convo,
        });

        for (let round = 0; round < 4 && response.stop_reason === "tool_use"; round++) {
            const toolUses = response.content.filter(
                (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
            );
            const results: Anthropic.ToolResultBlockParam[] = [];
            for (const tu of toolUses) {
                let output = "Unknown tool.";
                if (tu.name === "save_lead") output = await saveLead(tu.input, business);
                else if (tu.name === "book_appointment") output = await saveBooking(tu.input, business);
                results.push({ type: "tool_result", tool_use_id: tu.id, content: output });
            }
            convo = [
                ...convo,
                { role: "assistant", content: response.content },
                { role: "user", content: results },
            ];
            response = await client.messages.create({
                model: MODEL,
                max_tokens: 400,
                system,
                tools,
                messages: convo,
            });
        }

        const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
        const reply =
            text ||
            `Thanks! We have your request and will follow up shortly. You can also call us at ${business.phone}.`;
        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Agent error:", error instanceof Error ? error.message : "unknown");
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}