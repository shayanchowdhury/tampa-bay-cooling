import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "../../../lib/supabase";
import { getBusiness, type BusinessConfig } from "../../../lib/businesses";

const client = new Anthropic();

const MODEL = "claude-haiku-5-5";

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

function buildSystemPrompt(b: BusinessConfig): string {
  return [
    `You are the website assistant for ${b.name}, a ${b.industry} business in ${b.city}.${b.demo ? " This is a demo." : ""}`,
    `Help visitors with questions about these services: ${b.services.join(", ")}.`,
    `Business phone: ${b.phone}. ${b.hours}`,
    b.notes,
    "Never invent prices, availability, or promises. If you don't know something, say someone from the team will follow up.",
    "When someone wants a quote or service, ask for their name, phone number, and which service they need, one question at a time. Don't ask them to re-confirm details they already gave.",
    "Once you have all three, call the save_lead tool exactly once. Never call it before you have all three. If the visitor was already told someone will follow up, don't call it again unless they give new details.",
    "After it succeeds, tell them someone will follow up, without promising a specific time.",
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
          service: { type: "string", enum: b.services },
          message: { type: "string", description: "Optional short note about the request." },
        },
        required: ["name", "phone", "service"],
      },
    },
  ];
}

type ChatMessage = { role: "user" | "assistant"; content: string };

async function saveLead(input: unknown, b: BusinessConfig): Promise<string> {
  const data = (input ?? {}) as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim().slice(0, 100) : "";
  const phone = typeof data.phone === "string" ? data.phone.trim().slice(0, 30) : "";
  const service = typeof data.service === "string" ? data.service : "";
  const note = typeof data.message === "string" ? data.message.trim().slice(0, 500) : "";

  if (!name || !phone || !b.services.includes(service)) {
    return "Missing or invalid details. Ask the visitor for what is missing.";
  }

  const tag = `[chat: ${b.name}]`;
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

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;
    if (apiKey && notifyEmail) {
      const resend = new Resend(apiKey);
      const { error: emailError } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: notifyEmail,
        subject: `New chat lead (${b.name}): ${service}`,
        text: [
          `Business: ${b.name}`,
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Service: ${service}`,
          `Message: ${note || "(none)"}`,
          "Source: website chat",
        ].join("\n"),
      });
      if (emailError) console.error("Lead email error:", emailError.message);
    }
  } catch {
    console.error("Lead email failed");
  }

  return "Lead saved. Tell the visitor someone will follow up.";
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

  const business = getBusiness(body.businessId);
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
    const history: Anthropic.MessageParam[] = messages;
    let response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system,
      tools,
      messages: history,
    });

    if (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        const output =
          tu.name === "save_lead" ? await saveLead(tu.input, business) : "Unknown tool.";
        results.push({ type: "tool_result", tool_use_id: tu.id, content: output });
      }
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 300,
        system,
        tools,
        messages: [
          ...history,
          { role: "assistant", content: response.content },
          { role: "user", content: results },
        ],
      });
    }

    const reply = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Agent error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}