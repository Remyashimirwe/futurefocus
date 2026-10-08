"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { PROGRAMS } from "@/lib/program-data";

// ─── Shared field styles (matches ContactSection conventions) ─────
const inputStyle: React.CSSProperties = {
  background: "white",
  border: "1.5px solid var(--gray-100)",
  color: "var(--gray-900)",
  fontFamily: "var(--font-body)",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  color: "var(--gray-700)",
  fontFamily: "var(--font-heading)",
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "var(--ff-400)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "var(--gray-100)";
  },
};

// ─── Field primitives ─────────────────────────────────────────────
function TextField({
  id,
  label,
  type = "text",
  placeholder,
  required = true,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={labelStyle}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
        style={inputStyle}
        {...focusHandlers}
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
      <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={labelStyle}>{label}</label>
      <select
        id={id}
        name={id}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
        style={inputStyle}
        {...focusHandlers}
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
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: "var(--ff-100)", color: "var(--ff-700)", fontFamily: "var(--font-heading)" }}
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

// ─── Main component ───────────────────────────────────────────────
export default function ApplyForm({ courses }: { courses?: string[] }) {
  const [delivery, setDelivery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

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
    setSubmitted(false);
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        id="apply-hero"
        data-nav-theme="dark"
        style={{
          background: "linear-gradient(135deg, #003d38 0%, #005850 45%, #00706b 100%)",
          paddingTop: "calc(var(--navbar-h, 64px) + 4.5rem)",
          paddingBottom: "4.5rem",
        }}
      >
        <div className="ff-container">
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
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────────── */}
      <section className="ff-section bg-white" data-nav-theme="light">
        <div className="ff-container max-w-3xl">
          <div id="apply-form" style={{ scrollMarginTop: "calc(var(--navbar-h, 64px) + 1.5rem)" }}>
            {submitted ? (
              /* Success state */
              <div
                className="rounded-2xl p-10 text-center flex flex-col items-center gap-5"
                style={{ background: "var(--ff-50)", border: "1px solid var(--ff-100)" }}
                role="status"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "var(--ff-500)", color: "#fff" }}
                  aria-hidden="true"
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
                  Application Submitted!
                </h2>
                <p className="max-w-md" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
                  Thank you for applying to Future Focus Academy. We&apos;ve received your application and our team will contact you shortly with the next steps.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                  <Link href="/" className="btn-brand">
                    Back to Home
                  </Link>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full px-6 py-3 text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-heading)",
                      background: "white",
                      border: "1.5px solid var(--gray-100)",
                      color: "var(--gray-700)",
                      cursor: "pointer",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ff-400)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--gray-100)")}
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            ) : (
              <form
                ref={formRef}
                className="rounded-2xl p-8 flex flex-col gap-9"
                style={{ background: "var(--ff-50)", border: "1px solid var(--ff-100)" }}
                onSubmit={handleSubmit}
                aria-label="Application form"
              >
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
                    <TextField id="dateOfBirth" label="Date of Birth" type="date" />
                    <SelectField
                      id="gender"
                      label="Gender"
                      placeholder="Select gender"
                      options={["Female", "Male", "Other", "Prefer not to say"]}
                    />
                  </div>
                </FormSection>

                {/* 2 — Address */}
                <FormSection num="2" title="Address" desc="Where we can reach you.">
                  <TextField id="streetAddress" label="Street Address" placeholder="KN 3 Ave, Nyarugenge" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField id="city" label="City / Town" placeholder="Kigali" />
                    <TextField id="district" label="District" placeholder="Nyarugenge" />
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
                    />
                    <TextField id="country" label="Country" placeholder="Rwanda" defaultValue="Rwanda" />
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
                          className="rounded-xl p-4 flex items-start gap-3 cursor-pointer"
                          style={{
                            background: active ? "var(--ff-50)" : "white",
                            border: `1.5px solid ${active ? "var(--ff-500)" : "var(--gray-100)"}`,
                            transition: "border-color 0.2s, background 0.2s",
                          }}
                        >
                          <input
                            type="radio"
                            name="deliveryMode"
                            value={opt.value}
                            required
                            checked={active}
                            onChange={() => setDelivery(opt.value)}
                            style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--ff-500)", cursor: "pointer" }}
                          />
                          <span className="flex flex-col gap-1.5">
                            <span className="flex items-center gap-2 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                              <span style={{ color: "var(--ff-500)", display: "inline-flex" }}>{opt.icon}</span>
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
                    className="text-sm rounded-xl px-4 py-2.5"
                    role="alert"
                    style={{ background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318", fontFamily: "var(--font-body)" }}
                  >
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
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
