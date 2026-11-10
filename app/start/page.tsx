import StartForm from "../components/StartForm";

export const instant = false;

export default function StartPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">
          AI chat assistant for local service businesses
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Never miss a customer again.
        </h1>
        <p className="mt-4 text-lg text-slate-700">
          Tell us about your business. In about a minute you get a working chat
          assistant that answers questions, collects customer details, and
          sends booking requests straight to your email, even at 2 AM.
        </p>
        <div className="mt-8">
          <StartForm />
        </div>
      </main>
    </div>
  );
}