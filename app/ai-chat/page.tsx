import Link from "next/link";

export const metadata = {
  title: "AI Chat Assistants for Local Service Businesses",
  description:
    "An AI assistant on your website that answers customer questions 24/7, collects their details and emails you the lead instantly.",
};

const steps = [
  {
    title: "A customer visits your site",
    text: "The assistant answers questions about your services, hours and area, day or night.",
  },
  {
    title: "It collects the lead",
    text: "It asks for their name, phone number and the job they need, one question at a time.",
  },
  {
    title: "You get the email",
    text: "The lead lands in your inbox right away, scored hot, warm or cold with a one-line summary.",
  },
];

const tiers = [
  {
    name: "Starter",
    price: "$150",
    days: "5 days",
    points: [
      "AI chat assistant on your website",
      "Collects name, phone and the job needed",
      "Leads emailed to you instantly",
      "1 revision",
    ],
  },
  {
    name: "Standard",
    price: "$250",
    days: "7 days",
    points: [
      "Everything in Starter",
      "Every lead scored hot, warm or cold",
      "One-sentence summary of each lead",
      "2 revisions",
    ],
  },
  {
    name: "Advanced",
    price: "$400",
    days: "10 days",
    points: [
      "Everything in Standard",
      "Branded to match your site",
      "14 days of support after launch",
      "3 revisions",
    ],
  },
];

export default function AiChatPage() {
  const mail =
    "mailto:shayanchowdhury05@gmail.com?subject=AI%20chat%20assistant%20for%20my%20business";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          For plumbers, HVAC, electricians and other local service businesses
        </p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
          Stop losing jobs to missed calls and late replies
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          I build an AI assistant for your website that answers customer questions 24/7,
          collects their details and emails you the lead the moment they finish chatting.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/demo/bay-plumbing"
            className="rounded-full bg-sky-700 px-6 py-3 font-semibold text-white hover:bg-sky-800"
          >
            Try the live demo
          </Link>
          <a
            href={mail}
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50"
          >
            Get one for your business
          </a>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-800">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold">Simple fixed pricing</h2>
          <p className="mt-2 text-center text-slate-600">
            One-time setup. Delivered on your site with the leads going to your inbox.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {tiers.map((t) => (
              <div key={t.name} className="flex flex-col rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold">{t.name}</h3>
                <p className="mt-2 text-3xl font-bold">{t.price}</p>
                <p className="text-sm text-slate-500">Delivered in {t.days}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                  {t.points.map((p) => (
                    <li key={p}>- {p}</li>
                  ))}
                </ul>
                <a
                  href={mail}
                  className="mt-6 rounded-full bg-sky-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-sky-800"
                >
                  Ask about {t.name}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            The assistant always tells customers it is an AI. Works on any site that lets you add a
            small code snippet.
          </p>
        </div>
      </section>

      <section className="bg-slate-900 px-6 py-14 text-center text-white">
        <h2 className="text-2xl font-bold">Want one on your website?</h2>
        <p className="mt-2 text-slate-300">Email me and I will reply the same day.</p>
        <a
          href={mail}
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-100"
        >
          shayanchowdhury05@gmail.com
        </a>
      </section>
    </main>
  );
}