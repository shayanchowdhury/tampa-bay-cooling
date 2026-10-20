import QuoteForm from "./components/QuoteForm";

const phoneDisplay = "(813) 555-0148";
const phoneHref = "tel:+18135550148";

const services = [
  {
    name: "AC Repair",
    description:
      "Same-day diagnostics and repairs for leaks, weak airflow, frozen coils, and systems that will not cool.",
  },
  {
    name: "Installation",
    description:
      "Energy-efficient AC replacements sized for Tampa homes, with clean installs and no-surprise pricing.",
  },
  {
    name: "Maintenance",
    description:
      "Seasonal tune-ups that keep humidity in check, lower energy bills, and help you avoid midsummer breakdowns.",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-sky-50 text-slate-900">
      <header className="border-b border-sky-100 bg-white/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#top" className="text-lg font-semibold tracking-tight text-sky-900">
            Tampa Bay Cooling
          </a>
          <a
            href={phoneHref}
            className="text-sm font-medium text-sky-800 hover:text-sky-950"
          >
            {phoneDisplay}
          </a>
        </div>
      </header>

      <main id="top" className="flex-1">
        <section className="bg-gradient-to-b from-sky-100 to-sky-50">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="flex flex-col items-start gap-6">
              <p className="rounded-full bg-white px-3 py-1 text-sm font-medium text-sky-800 shadow-sm">
                HVAC service in Tampa, Florida
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-sky-950 sm:text-5xl">
                Stay cool when Tampa heat hits hardest.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Tampa Bay Cooling keeps homes and small businesses comfortable
                through humid summers, sudden storms, and everything in between.
                Licensed techs. Honest quotes. Fast response.
              </p>
              <a
                href="#quote"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-sky-700 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-sky-800 sm:w-auto"
              >
                Get a free quote
              </a>
            </div>
            <div className="rounded-3xl bg-sky-900 p-6 text-sky-50 shadow-lg sm:p-8">
              <p className="text-sm font-medium uppercase tracking-wide text-sky-200">
                Why neighbors call us
              </p>
              <ul className="mt-6 space-y-4 text-base leading-7">
                <li>Local Tampa crews who know Florida humidity</li>
                <li>Upfront pricing before any work begins</li>
                <li>Repair, replace, or maintain — one team</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="services" className="bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-3xl font-semibold tracking-tight text-sky-950">
              Services
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              From emergency AC repair to new installs and seasonal maintenance,
              we cover the cooling work Tampa homes need most.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.name}
                  className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-6"
                >
                  <h3 className="text-xl font-semibold text-sky-900">
                    {service.name}
                  </h3>
                  <p className="text-base leading-7 text-slate-600">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="quote" className="bg-sky-800 scroll-mt-4">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Request a free quote
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-sky-100">
              Tell us what you need and we will call you back with a clear
              estimate. No pressure, no surprise fees.
            </p>
            <QuoteForm />
            <p className="pt-2 text-sm text-sky-200">
              Prefer to talk now?{" "}
              <a
                href={phoneHref}
                className="font-semibold text-white underline-offset-2 hover:underline"
              >
                Call {phoneDisplay}
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-sky-950 text-sky-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-medium text-white">Tampa Bay Cooling</p>
          <p>
            Call us at{" "}
            <a href={phoneHref} className="font-semibold text-white underline-offset-2 hover:underline">
              {phoneDisplay}
            </a>
          </p>
          <p className="text-sm text-sky-300">Serving Tampa, Florida</p>
        </div>
      </footer>
    </div>
  );
}
