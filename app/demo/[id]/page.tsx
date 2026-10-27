import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChatWidget from "../../components/ChatWidget";
import { getBusiness } from "../../../lib/businesses";

export const metadata: Metadata = {
  title: "Demo business page",
  robots: { index: false, follow: false },
};
export const instant = false;
export default async function DemoBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = getBusiness(id);
  if (!business) notFound();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900 sm:text-sm">
        Demo page for a fictional business.
      </div>
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-sm text-slate-500">
          {business.city} · {business.industry}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-sky-950">{business.name}</h1>
        <p className="mt-4 text-lg text-slate-600">{business.hours}</p>
        <p className="mt-2 text-lg text-slate-600">Call {business.phone}</p>
        <h2 className="mt-10 text-2xl font-semibold text-sky-900">Services</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {business.services.map((service) => (
            <li key={service} className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
              {service}
            </li>
          ))}
        </ul>
      </main>
      <ChatWidget businessId={business.id} />
    </div>
  );
}