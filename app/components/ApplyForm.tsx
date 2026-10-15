"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { PROGRAMS } from "@/lib/program-data";

// ─── Field styles ────────────────────────────────────────────────
/* Border lives in Tailwind classes (not inline) so focus: variants can win. */
const inputClass =
  "w-full rounded-xl px-4 py-3 text-sm outline-none bg-white text-[var(--gray-900)] [border:1.5px_solid_var(--gray-100)] focus:border-[var(--ff-400)] focus:shadow-[0_0_0_4px_var(--ff-100)] transition-shadow duration-200";

const labelClass = "block text-sm font-medium mb-1.5 text-[var(--gray-700)]";

// ─── Field primitives ─────────────────────────────────────────────
function TextField({
  id,
  label,
  type = "text",
  placeholder,
  required = true,
  defaultValue,
  optional,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  optional?: boolean;
}) {
  const isRequired = optional ? false : required;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional && (
          <span className="ml-1.5 text-xs font-normal" style={{ color: "var(--gray-400, #9aa3a3)" }}>
            (optional)
          </span>
        )}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={isRequired}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  placeholder,
  options,
  defaultValue,
  required = true,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: string[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <select
        id={id}
        name={id}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={`${inputClass} cursor-pointer`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Numbered section wrapper ─────────────────────────────────────
function FormSection({
  num,
  title,
  desc,
  children,
}: {
  num: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
      <div className="flex items-center gap-3.5 mb-5">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 text-white"
          style={{
            fontFamily: "var(--font-heading)",
            background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))",
            boxShadow: "0 8px 18px -8px rgba(0,167,157,0.7)",
          }}
          aria-hidden="true"
        >
          {num}
        </span>
        <div>
          <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
            {title}
          </h3>
          <p className="text-xs" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)" }}>
            {desc}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </fieldset>
  );
}

const TIME_SLOTS = [
  "Morning — 8:30 to 10:30",
  "Afternoon — 14:30 to 16:30",
  "Evening — 18:00 to 20:00",
];

const DELIVERY_OPTIONS = [
  {
    value: "In-Person Class",
    desc: "Attend live sessions at our Kigali campus with hands-on projects and mentor support.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /></svg>
    ),
  },
  {
    value: "Online Class",
    desc: "Join live virtual sessions from anywhere, with recordings and online support.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
    ),
  },
];

/** Small glass pill shown under the hero copy. */
const TRUST_CHIPS = [
  {
    label: "Free to apply",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
    ),
  },
  {
    label: "Takes 3 minutes",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    ),
  },
  {
    label: "Reply within 48 hours",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
    ),
  },
];

// ─── Main component ───────────────────────────────────────────────
export default function ApplyForm({ courses }: { courses?: string[] }) {
  const [delivery, setDelivery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  /** Live completion meter — counts the details we always need. */
  const updateProgress = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const required = ["firstName", "lastName", "email", "phone", "course", "schedule", "deliveryMode"];
    const done = required.filter((key) => String(data.get(key) ?? "").trim().length > 0).length;
    setProgress(Math.round((done / required.length) * 100));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          email: data.get("email"),
          phone: data.get("phone"),
          dateOfBirth: data.get("dateOfBirth"),
          gender: data.get("gender"),
          streetAddress: data.get("streetAddress"),
          city: data.get("city"),
          district: data.get("district"),
          province: data.get("province"),
          country: data.get("country"),
          course: data.get("course"),
          schedule: data.get("schedule"),
          deliveryMode: data.get("deliveryMode"),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }
      setFirstName(String(data.get("firstName") ?? "").trim());
      setSubmitted(true);
      requestAnimationFrame(() => {
        document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    formRef.current?.reset();
    setDelivery("");
    setProgress(0);
    setSubmitted(false);
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        id="apply-hero"
        data-nav-theme="dark"
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #003d38 0%, #005850 45%, #00706b 100%)",
          paddingTop: "calc(var(--navbar-h, 64px) + 4.5rem)",
          paddingBottom: "6.5rem",
        }}
      >
        {/* decorative orbs */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-16 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(79,205,196,0.35), transparent 70%)" }} />
          <div className="absolute -bottom-32 left-[-6rem] h-96 w-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,167,157,0.3), transparent 70%)" }} />
        </div>

        <div className="ff-container relative">
          <span
            className="text-xs font-semibold tracking-[0.16em] uppercase mb-3 block"
            style={{ color: "var(--ff-300)", fontFamily: "var(--font-heading)" }}
          >
            Admissions
          </span>
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
            style={{ fontFamily: "var(--font-heading)", color: "#fff" }}
          >
            Apply to Future Focus<br />
            <span style={{ color: "var(--ff-300)" }}>Academy</span>
          </h1>
          <p
            className="text-lg max-w-2xl"
            style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}
          >
            Tell us a little about yourself, pick a course and schedule that works for you, and we&apos;ll get back to you with the next steps.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {TRUST_CHIPS.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold backdrop-blur-md"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  color: "#fff",
                }}
              >
                <span style={{ color: "var(--ff-300)", display: "inline-flex" }} aria-hidden="true">{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────────── */}
      <section
        className="ff-section relative"
        data-nav-theme="light"
        style={{ background: "var(--gray-100)" }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(700px 320px at 85% 0%, rgba(0,167,157,0.10), transparent 60%)" }} />
        <div className="ff-container max-w-3xl relative">
          <div id="apply-form" style={{ scrollMarginTop: "calc(var(--navbar-h, 64px) + 1.5rem)" }}>
            {submitted ? (
              /* ── Success state ── */
              <div
                className="relative overflow-hidden rounded-[28px] p-8 sm:p-12 text-center flex flex-col items-center gap-5"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(18px) saturate(150%)",
                  WebkitBackdropFilter: "blur(18px) saturate(150%)",
                  border: "1px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 40px 90px -40px rgba(0,43,39,0.5)",
                  animation: "ffCardIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
                role="status"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "linear-gradient(90deg, var(--ff-500), var(--ff-300) 45%, rgba(79,205,196,0))" }} />
                <span aria-hidden="true" className="absolute -top-24 -right-16 h-56 w-56 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,167,157,0.14), transparent 70%)" }} />

                {/* Animated check */}
                <div className="relative" aria-hidden="true">
                  <span className="absolute inset-0 rounded-full" style={{ background: "var(--ff-500)", opacity: 0.25, animation: "ffPing 1.6s cubic-bezier(0,0,0.2,1) infinite" }} />
                  <div
                    className="relative h-20 w-20 rounded-full flex items-center justify-center text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--ff-400), var(--ff-700))",
                      boxShadow: "0 16px 36px -12px rgba(0,167,157,0.8)",
                      animation: "ffScaleIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
                    {firstName ? `Thanks, ${firstName}!` : "Application submitted!"}
                  </h2>
                  <p className="mt-2 max-w-md mx-auto" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
                    We&apos;ve received your application and saved your spot in the queue. Keep your phone close — we usually reply within 48 hours.
                  </p>
                </div>

                {/* What happens next */}
                <div
                  className="w-full max-w-md rounded-2xl p-5 text-left"
                  style={{ background: "var(--ff-50)", border: "1px solid var(--ff-100)" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--ff-700)", fontFamily: "var(--font-heading)" }}>
                    What happens next
                  </p>
                  <ol className="space-y-3">
                    {[
                      "Our admissions team reviews your application.",
                      "We call or email you with the details and any questions.",
                      "You confirm your spot and get your start date.",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="mt-0.5 h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white"
                          style={{ fontFamily: "var(--font-heading)", background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))" }}
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm leading-snug" style={{ color: "var(--gray-700)", fontFamily: "var(--font-body)" }}>
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                  <Link href="/" className="btn-brand">
                    Back to Home
                  </Link>
                  <Link
                    href="/programs"
                    className="rounded-full px-6 py-3 text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-heading)",
                      background: "white",
                      border: "1.5px solid var(--gray-100)",
                      color: "var(--gray-700)",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                  >
                    Browse Programs
                  </Link>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-sm font-semibold underline-offset-4 hover:underline cursor-pointer"
                    style={{ background: "none", border: "none", color: "var(--ff-700)", fontFamily: "var(--font-heading)" }}
                  >
                    Submit another application
                  </button>
                </div>
              </div>
            ) : (
              /* ── Form card ── */
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                onInput={updateProgress}
                onChange={updateProgress}
                className="relative rounded-[28px] p-7 sm:p-10 flex flex-col gap-9"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(18px) saturate(150%)",
                  WebkitBackdropFilter: "blur(18px) saturate(150%)",
                  border: "1px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 40px 90px -44px rgba(0,43,39,0.55)",
                }}
                aria-label="Application form"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 rounded-t-[28px] h-[3px]" style={{ background: "linear-gradient(90deg, var(--ff-500), var(--ff-300) 45%, rgba(79,205,196,0))" }} />

                {/* Live progress meter */}
                <div className="flex items-center gap-3 -mb-2">
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "var(--gray-100)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--ff-500), var(--ff-300))" }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Form completion"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap" style={{ color: "var(--gray-500)", fontFamily: "var(--font-heading)" }}>
                    {progress}% complete
                  </span>
                </div>

                {/* 1 — Personal Information */}
                <FormSection num="1" title="Personal Information" desc="Your basic contact details.">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField id="firstName" label="First Name" placeholder="Jane" />
                    <TextField id="lastName" label="Last Name" placeholder="Doe" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField id="email" label="Email Address" type="email" placeholder="jane@example.com" />
                    <TextField id="phone" label="Phone Number" type="tel" placeholder="+250 700 000 000" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField id="dateOfBirth" label="Date of Birth" type="date" optional />
                    <SelectField
                      id="gender"
                      label="Gender"
                      placeholder="Select gender"
                      options={["Female", "Male", "Other", "Prefer not to say"]}
                      required={false}
                    />
                  </div>
                </FormSection>

                {/* 2 — Address */}
                <FormSection num="2" title="Address" desc="Where we can reach you.">
                  <TextField id="streetAddress" label="Street Address" placeholder="KN 3 Ave, Nyarugenge" optional />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField id="city" label="City / Town" placeholder="Kigali" optional />
                    <TextField id="district" label="District" placeholder="Nyarugenge" optional />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <SelectField
                      id="province"
                      label="Province"
                      placeholder="Select province"
                      options={[
                        "Kigali City",
                        "Southern Province",
                        "Northern Province",
                        "Western Province",
                        "Eastern Province",
                        "Outside Rwanda",
                      ]}
                      required={false}
                    />
                    <TextField id="country" label="Country" placeholder="Rwanda" defaultValue="Rwanda" optional />
                  </div>
                </FormSection>

                {/* 3 — Course */}
                <FormSection num="3" title="Course" desc="Choose the program you want to join.">
                  <SelectField
                    id="course"
                    label="Course / Program"
                    placeholder="Select a course"
                    options={courses ?? PROGRAMS.map((p) => p.title)}
                  />
                </FormSection>

                {/* 4 — Schedule */}
                <FormSection num="4" title="Schedule" desc="Pick the time slot that works best for you.">
                  <SelectField
                    id="schedule"
                    label="Preferred Time Slot"
                    placeholder="Select a time slot"
                    options={TIME_SLOTS}
                  />
                </FormSection>

                {/* 5 — Delivery Mode */}
                <FormSection num="5" title="Delivery Mode" desc="How would you like to attend classes?">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {DELIVERY_OPTIONS.map((opt) => {
                      const active = delivery === opt.value;
                      return (
                        <label
                          key={opt.value}
                          className="relative rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all duration-200"
                          style={{
                            background: active ? "var(--ff-50)" : "white",
                            border: `1.5px solid ${active ? "var(--ff-500)" : "var(--gray-100)"}`,
                            boxShadow: active ? "0 10px 26px -14px rgba(0,167,157,0.6)" : "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="deliveryMode"
                            value={opt.value}
                            required
                            checked={active}
                            onChange={() => setDelivery(opt.value)}
                            className="sr-only"
                          />
                          {/* custom radio dot */}
                          <span
                            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
                            style={{
                              border: `2px solid ${active ? "var(--ff-500)" : "var(--gray-300)"}`,
                              background: active ? "var(--ff-500)" : "transparent",
                            }}
                            aria-hidden="true"
                          >
                            {active && (
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            )}
                          </span>
                          <span className="flex flex-col gap-1.5">
                            <span className="flex items-center gap-2 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: active ? "var(--ff-700)" : "var(--gray-900)" }}>
                              <span style={{ color: active ? "var(--ff-500)" : "var(--gray-400, #9aa3a3)", display: "inline-flex" }}>{opt.icon}</span>
                              {opt.value}
                            </span>
                            <span className="text-xs leading-relaxed" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)" }}>
                              {opt.desc}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </FormSection>

                {submitError && (
                  <p
                    className="flex items-start gap-2 text-sm rounded-xl px-4 py-2.5"
                    role="alert"
                    style={{ background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318", fontFamily: "var(--font-body)" }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v5M12 16.5v.01" />
                    </svg>
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-brand justify-center w-full group disabled:opacity-70"
                  style={{ cursor: submitting ? "wait" : "pointer" }}
                  onMouseDown={(e) => { if (!submitting) e.currentTarget.style.transform = "scale(0.97)"; }}
                  onMouseUp={(e)   => { e.currentTarget.style.transform = ""; }}
                >
                  {submitting ? "Submitting…" : "Submit Application"}
                  {!submitting && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                <p className="text-center text-xs" style={{ color: "var(--gray-500)" }}>
                  Your details stay private and are only used for admission.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
