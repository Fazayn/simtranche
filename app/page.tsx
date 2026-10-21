 
// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gray-100 p-8">
//       <h1 className="text-3xl font-bold text-gray-900">
//         Simtranche Booking Platform
//       </h1>

//       <p className="mt-4 text-gray-600">
//         Manage organizations, users, and bookings in one place.
//       </p>

//       <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
//         <h2 className="text-xl font-semibold">
//           Welcome to your workspace
//         </h2>

//         <p className="mt-2 text-gray-600">
//           Your booking platform is being built.
//         </p>
//       </div>
//     </main>
//   );
// }

import Link from "next/link";

const features = [
  {
    icon: "🏢",
    title: "Multi-Tenant Architecture",
    description:
      "Manage multiple organizations with isolated data and organization-specific settings.",
  },
  {
    icon: "📅",
    title: "Booking Management",
    description:
      "Create, manage, and organize appointments with a clear booking workflow.",
  },
  {
    icon: "🛡️",
    title: "Secure by Design",
    description:
      "Build around tenant isolation, access controls, and protected business data.",
  },
  {
    icon: "💳",
    title: "Subscriptions & Billing",
    description:
      "Prepare your business for subscription plans, checkout, and billing history.",
  },
  {
    icon: "🤝",
    title: "Team Collaboration",
    description:
      "Give teams a shared workspace for managing appointments and customer needs.",
  },
  {
    icon: "⚡",
    title: "Built to Scale",
    description:
      "A foundation designed for caching, reliable operations, and future growth.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="border-b border-white/10 bg-[#080d1c] text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-indigo-400">S</span>imtranche
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <a href="#about" className="hover:text-white">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-slate-500 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-500"
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
            <div>
              <span className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-200">
                Multi-tenant booking platform
              </span>

              <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                One platform.
                <span className="block text-indigo-400">
                  Every location.
                </span>
                Total control.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Manage appointments, teams, and multiple business locations
                from one organized workspace. Simtranche is built for
                service businesses ready to grow.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                >
                  Get started free →
                </Link>
                <a
                  href="#features"
                  className="rounded-xl border border-slate-500 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
                >
                  Explore features
                </a>
              </div>

              <p className="mt-6 text-sm text-slate-400">
                Designed for salons, clinics, franchises, and growing teams.
              </p>
            </div>

            {/* Dashboard preview */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-indigo-950/40 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-5">
                <div>
                  <p className="font-bold text-white">Business overview</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Your workspace at a glance
                  </p>
                </div>
                <span className="rounded-lg bg-indigo-500/15 px-3 py-2 text-xs text-indigo-300">
                  All locations
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ["Today's bookings", "24"],
                  ["Active clients", "186"],
                  ["Locations", "04"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                  >
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="mt-3 text-2xl font-bold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-semibold text-white">Upcoming bookings</p>
                  <span className="text-xs text-indigo-300">Preview</span>
                </div>

                {[
                  ["10:00 AM", "Consultation", "Confirmed"],
                  ["11:30 AM", "Hair appointment", "Confirmed"],
                  ["01:00 PM", "Follow-up visit", "Pending"],
                ].map(([time, service, status]) => (
                  <div
                    key={time}
                    className="flex items-center justify-between gap-3 border-t border-slate-700 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {service}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{time}</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center text-xs text-slate-500">
                Illustrative dashboard preview · Sample data
              </p>
            </div>
          </div>
        </section>
      </header>

      {/* Features */}
      <section id="features" className="scroll-mt-8 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              The Simtranche platform
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything your growing business needs
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Bring your booking operations together with a platform designed
              for multiple organizations, locations, and teams.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-slate-50 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold">
            One workspace. Multiple businesses.
          </h2>
          <p className="mt-5 leading-7 text-slate-600">
            Whether you manage a single service business or a growing
            franchise, Simtranche aims to make booking operations easier to
            organize as your business expands.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="bg-[#080d1c] px-6 py-20 text-white lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Your next chapter starts here
          </p>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            Ready to organize your bookings?
          </h2>
          <p className="mt-5 leading-7 text-slate-300">
            Get started with Simtranche and build a more organized way to
            manage your service business.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold hover:bg-indigo-500"
            >
              Get started →
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-500 px-6 py-3.5 font-semibold hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#080d1c] px-6 py-6 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm sm:flex-row">
          <p>
            <span className="font-bold text-white">Simtranche</span> · Booking
            operations for growing businesses.
          </p>
           <p>© 2026 Simtranche</p>
        </div>
      </footer>
    </main>
  );
}
