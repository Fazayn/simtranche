"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

type Mode = "onboarding" | "login" | "register" | "forgot-password";
type RegistrationType = "register" | "onboarding";


const schemas = {
  onboarding: z.object({
    organizationName: z.string().trim().min(2, "Organization name must be at least 2 characters."),
    slug: z
      .string()
      .trim()
      .min(3, "Workspace slug must be at least 3 characters.")
      .max(40)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
    name: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must contain at least 8 characters."),
  }),
  login: z.object({
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(1, "Enter your password."),
  }),
  register: z.object({
    name: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must contain at least 8 characters."),
  }),
  "forgot-password": z.object({
    email: z.string().trim().email("Enter a valid email address."),
  }),
};

const config = {
  onboarding: {
    eyebrow: "GET STARTED",
    title: "Create your workspace",
    description: "Set up your organization and bring your bookings into one place.",
    button: "Create workspace",
  },
  login: {
    eyebrow: "WELCOME BACK",
    title: "Sign in to Simtranche",
    description: "Manage your schedule, team, and bookings.",
    button: "Sign in",
  },
  register: {
    eyebrow: "NEW TO SIMTRANCHE",
    title: "Create your account",
    description: "Start organizing your work with Simtranche.",
    button: "Create account",
  },
  "forgot-password": {
    eyebrow: "ACCOUNT RECOVERY",
    title: "Reset your password",
    description: "Enter the email linked to your account and we'll help you get back in.",
    button: "Send reset instructions",
  },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const [registrationType, setRegistrationType] =
    useState<RegistrationType>("register");

  // Only the registration page switches between account and workspace forms.
  const activeMode: Mode =
    mode === "register" ? registrationType : mode;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({
    organizationName: "",
    slug: "",
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const copy = config[activeMode];

  function update(field: string, value: string) {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (
        field === "organizationName" &&
        activeMode === "onboarding" &&
        !current.slug
      ) {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      return next;
    });

    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
  }

  function switchRegistrationType(type: RegistrationType) {
    setRegistrationType(type);
    setErrors({});
    setNotice("");
  }

  
async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (isSubmitting) return;

  const result = schemas[activeMode].safeParse(values);

  if (!result.success) {
    const nextErrors: Record<string, string> = {};

    result.error.issues.forEach((issue) => {
      const field = String(issue.path[0] ?? "form");
      if (!nextErrors[field]) {
        nextErrors[field] = issue.message;
      }
    });

    setErrors(nextErrors);
    setNotice("");
    return;
  }

  setErrors({});
  setNotice("");
  setIsSubmitting(true);

  try {
    if (activeMode !== "register") {
      setNotice(
        "This form is not connected to the backend yet."
      );
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    const data: { message?: string; error?: string } =
      await response.json();

    if (!response.ok) {
      setNotice(data.error ?? "Registration failed. Please try again.");
      return;
    }

    setNotice(
      "Account created successfully! You can now sign in."
    );
  } catch {
    setNotice(
      "Unable to connect to the server. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
}


  const inputClass = (field: string) =>
    `mt-1.5 block w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
      errors[field] ? "border-rose-400" : "border-slate-200"
    }`;

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900 lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#17183b] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <Link
          href="/"
          className="relative flex items-center gap-3 text-lg font-semibold tracking-tight"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-700">
            S
          </span>
          simtranche
        </Link>

        <div className="relative max-w-lg pb-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-indigo-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Booking operations, simplified
          </div>

          <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            More time for the work that matters.
          </h2>

          <p className="mt-5 max-w-md text-base leading-7 text-indigo-100/75">
            Keep your team, appointments, and organization in sync — all from
            one calm, clear workspace.
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-100/75">Your workspace</span>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                Organized
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { n: "Bookings", v: "One place" },
                { n: "Your team", v: "In sync" },
                { n: "Your data", v: "Separated" },
              ].map((item) => (
                <div key={item.n} className="rounded-xl bg-black/10 p-3">
                  <p className="text-xs text-indigo-100/60">{item.n}</p>
                  <p className="mt-1 text-sm font-medium">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="relative text-xs text-indigo-100/45">
          © 2026 Simtranche · Built for teams that care about better bookings.
        </p>
      </aside>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12 xl:px-20">
        <header className="flex items-center justify-between lg:justify-end">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight lg:hidden"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-700 text-white">
              S
            </span>
            simtranche
          </Link>

          <Link
            href="/"
            className="text-sm text-slate-500 transition hover:text-indigo-700"
          >
            Back to home <span aria-hidden="true">↗</span>
          </Link>
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-7">
            <p className="text-xs font-bold tracking-[0.18em] text-indigo-700">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {copy.description}
            </p>
          </div>

          {/* Two-option segmented control: registration page only */}
          {mode === "register" && (
            <div
              className="mb-6 flex w-full rounded-xl bg-slate-200/80 p-1"
              role="group"
              aria-label="Choose registration type"
            >
              <button
                type="button"
                aria-pressed={registrationType === "register"}
                onClick={() => switchRegistrationType("register")}
                className={`flex-1 rounded-lg px-3 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 ${
                  registrationType === "register"
                    ? "bg-indigo-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Create your account
              </button>

              <button
                type="button"
                aria-pressed={registrationType === "onboarding"}
                onClick={() => switchRegistrationType("onboarding")}
                className={`flex-1 rounded-lg px-3 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 ${
                  registrationType === "onboarding"
                    ? "bg-indigo-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Create your workspace
              </button>
            </div>
          )}

          <form onSubmit={submit} noValidate className="space-y-4">
            {activeMode === "onboarding" && (
              <>
                <div>
                  <label
                    htmlFor="organizationName"
                    className="text-sm font-medium text-slate-700"
                  >
                    Organization name
                  </label>
                  <input
                    id="organizationName"
                    value={values.organizationName}
                    onChange={(e) =>
                      update("organizationName", e.target.value)
                    }
                    placeholder="e.g. Northstar Studio"
                    className={inputClass("organizationName")}
                    autoComplete="organization"
                  />
                  {errors.organizationName && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.organizationName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="text-sm font-medium text-slate-700"
                  >
                    Workspace address
                  </label>

                  <div className="mt-1.5 flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                    <input
                      id="slug"
                      value={values.slug}
                      onChange={(e) =>
                        update("slug", e.target.value.toLowerCase())
                      }
                      placeholder="northstar-studio"
                      className="min-w-0 flex-1 px-3.5 py-3 text-sm outline-none"
                    />
                    <span className="flex items-center border-l border-slate-100 bg-slate-50 px-3 text-xs text-slate-500">
                      .simtranche.app
                    </span>
                  </div>

                  {errors.slug && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.slug}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Use lowercase letters, numbers, and hyphens.
                  </p>
                </div>
              </>
            )}

            {(activeMode === "onboarding" || activeMode === "register") && (
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Full name
                </label>
                <input
                  id="name"
                  value={values.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your name"
                  className={inputClass("name")}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@company.com"
                className={inputClass("email")}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>

            {activeMode !== "forgot-password" && (
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  {activeMode === "login" && (
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-indigo-700 hover:text-indigo-900"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder={
                      activeMode === "login"
                        ? "Enter your password"
                        : "At least 8 characters"
                    }
                    className={`${inputClass("password")} pr-16`}
                    autoComplete={
                      activeMode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    className="absolute inset-y-0 right-3 text-xs font-medium text-slate-500 hover:text-indigo-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800"
              >
                {notice}
              </div>
            )}

             
             <button
              type="submit"
               disabled={isSubmitting}
               className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-700/20 transition hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
             >
              {isSubmitting ? "Creating account..." : copy.button}
             {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>


            <p className="pt-1 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to our{" "}
              <a
                href="#terms"
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="#privacy"
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
              >
                Privacy Policy
              </a>
              .
            </p>
          </form>

          <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
            {activeMode === "login" && (
              <>
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Create one
                </Link>
              </>
            )}

            {activeMode === "register" && (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Sign in
                </Link>
              </>
            )}

            {activeMode === "onboarding" && (
              <>
                Already set up?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Sign in
                </Link>
              </>
            )}

            {activeMode === "forgot-password" && (
              <>
                Remembered it?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Back to sign in
                </Link>
              </>
            )}
          </div>
        </div>

        <footer className="text-center text-xs text-slate-400 lg:text-right">
          Secure workspace · Simple scheduling
        </footer>
      </section>
    </main>
  );
}