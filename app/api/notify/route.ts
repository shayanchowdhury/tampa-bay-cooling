import { Resend } from "resend";

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const name = requiredString(payload.name);
  const phone = requiredString(payload.phone);
  const service = requiredString(payload.service);
  const message = optionalString(payload.message);

  if (!name || !phone || !service) {
    return Response.json(
      { error: "Name, phone, and service are required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    return Response.json(
      { error: "Email notifications are not configured." },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: notifyEmail,
    subject: `New quote request: ${service}`,
    text: [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Service: ${service}`,
      `Message: ${message || "(none)"}`,
    ].join("\n"),
  });

  if (error) {
    return Response.json({ error: "Failed to send email." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
