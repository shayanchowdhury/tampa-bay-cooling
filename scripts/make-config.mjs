import Anthropic from "@anthropic-ai/sdk";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node --env-file=.env.local scripts/make-config.mjs https://their-site.com");
  process.exit(1);
}

const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
if (!res.ok) {
  console.error("Could not fetch the site. Status:", res.status);
  process.exit(1);
}

const html = await res.text();
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 12000);

const client = new Anthropic();
const response = await client.messages.create({
  model: "claude-haiku-5-5",
  max_tokens: 800,
  messages: [
    {
      role: "user",
      content:
        "From this website text, extract details about the local service business. " +
        'Reply with ONLY compact JSON: {"name":"","city":"","industry":"","phone":"","hours":"","services":[],"notes":""}. ' +
        "services is 3 to 6 short service names. notes is the service area and any pricing guidance stated on the site. " +
        'Never invent anything. If a field is not on the site, use "" or [].\n\nWebsite text:\n' +
        text,
    },
  ],
});

const raw = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
const match = raw.match(/\{[\s\S]*\}/);
if (!match) {
  console.error("Could not read the model reply:", raw);
  process.exit(1);
}
const d = JSON.parse(match[0]);

const name = d.name || "Business Name";
const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "new-client";
const services = Array.isArray(d.services) && d.services.length ? d.services : ["Service Request"];
const greeting = `Hi! I'm an AI assistant for ${name}. I can answer questions about ${services
  .slice(0, 3)
  .join(", ")}, or take your details so someone can follow up.`;
const notes = `${d.notes || ""} This is a demo prepared for ${name}.`.trim();

console.log(`
  ${JSON.stringify(slug)}: {
    id: ${JSON.stringify(slug)},
    name: ${JSON.stringify(name)},
    city: ${JSON.stringify(d.city || "")},
    industry: ${JSON.stringify(d.industry || "service")},
    phone: ${JSON.stringify(d.phone || "")},
    hours: ${JSON.stringify(d.hours || "Hours are not specified.")},
    services: ${JSON.stringify(services)},
    greeting:
      ${JSON.stringify(greeting)},
    notes: ${JSON.stringify(notes)},
    notifyEmail: "",
    demo: true,
  },
`);
console.log(`Paste the block above into BUSINESSES in lib/businesses.ts, then open:`);
console.log(`http://localhost:3000/demo/${slug}`);
console.log(`http://localhost:3000/embed/${slug}`);