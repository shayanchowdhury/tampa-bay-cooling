import { notFound } from "next/navigation";
import ChatWidget from "../../components/ChatWidget";
import { getBusinessAsync } from "../../../lib/business-store";

export const instant = false;

export default async function DemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getBusinessAsync(id);
  if (!business) notFound();

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">
          Live demo
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">{business.name}</h1>
        <p className="mt-2 text-slate-600">
          {business.city} · {business.industry}
        </p>
        <p className="mt-6 text-slate-700">
          This is what your customers would see. Click the Chat button in the
          bottom right and try it like a customer would: ask about a service,
          a price, or book a visit.
        </p>
        <ul className="mt-6 list-disc space-y-1 pl-6 text-slate-700">
          {business.services.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-slate-500">Phone: {business.phone}</p>

        <ChatWidget
          business={{
            id: business.id,
            name: business.name,
            greeting: business.greeting,
            phone: business.phone,
          }}
        />
      </main>
    </div>
  );
}