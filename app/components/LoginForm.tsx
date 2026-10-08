"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 1)}•••@${domain}`;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.01em",
  color: "var(--gray-700)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#f5f7f7",
  border: "1.5px solid transparent",
  borderRadius: "14px",
  padding: "0.8rem 0.95rem",
  fontSize: "0.9rem",
  color: "var(--gray-900)",
  fontFamily: "var(--font-body)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  outline: "none",
};

const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "var(--ff-400)";
  e.target.style.background = "#ffffff";
  e.target.style.boxShadow = "0 0 0 3px rgba(0, 167, 157, 0.13)";
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "transparent";
  e.target.style.background = "#f5f7f7";
  e.target.style.boxShadow = "none";
};

const quietBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "0.8rem",
  fontWeight: 700,
  cursor: "pointer",
};

export default function LoginForm() {
  const router = useRouter();

  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const requestCode = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      setDevCode(data.devCode ?? "");
      setCode("");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code.trim().length < 4) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setBusy(true);
    setError("");
    const result = await signIn("credentials", {
      email: email.trim(),
      code: code.trim(),
      redirect: false,
    });
    setBusy(false);

    if (result?.error) {
      setError("That code is invalid or has expired. Request a new one.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        minHeight: "100vh",
        padding: "2rem 1.25rem",
        background:
          "radial-gradient(880px 460px at 50% -12%, rgba(0,167,157,0.10), transparent 62%), radial-gradient(680px 420px at 92% 112%, rgba(0,112,107,0.10), transparent 60%), #fbfdfd",
      }}
      data-nav-theme="light"
    >
      {/* Decorative floating orbs */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          top: "8%",
          left: "6%",
          background: "radial-gradient(circle, rgba(79,205,196,0.32), transparent 65%)",
          filter: "blur(58px)",
          animation: "ffOrbFloat 14s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          bottom: "6%",
          right: "8%",
          background: "radial-gradient(circle, rgba(0,167,157,0.22), transparent 65%)",
          filter: "blur(58px)",
          animation: "ffOrbFloat 18s ease-in-out infinite reverse",
        }}
      />

      {/* Card */}
      <div className="relative w-full" style={{ maxWidth: 372, zIndex: 1 }}>
        <div
          className="rounded-[28px] p-7 flex flex-col gap-5"
          style={{
            background: "#ffffff",
            border: "1px solid var(--gray-100)",
            boxShadow:
              "0 1px 2px rgba(0,61,56,0.04), 0 28px 64px -28px rgba(0,61,56,0.28)",
            animation: "ffCardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {/* Brand + step progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0"
                style={{ border: "1px solid var(--gray-100)", boxShadow: "0 4px 12px -6px rgba(0,61,56,0.45)" }}
              >
                <Image
                  src="/future focus.jpeg"
                  alt="Future Focus Academy"
                  fill
                  sizes="40px"
                  priority
                  style={{ objectFit: "cover", transform: "scale(1.12)" }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                  color: "var(--gray-950)",
                }}
              >
                Future Focus
                <br />
                Academy
              </span>
            </div>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span
                style={{
                  width: step === "credentials" ? 20 : 8,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--ff-500)",
                  transition: "width 0.3s ease",
                }}
              />
              <span
                style={{
                  width: step === "code" ? 20 : 8,
                  height: 6,
                  borderRadius: 999,
                  background: step === "code" ? "var(--ff-500)" : "var(--gray-100)",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Heading */}
          <div key={`head-${step}`} style={{ animation: "ffFadeUp 0.45s ease both" }}>
            <h1
              className="mb-1"
              style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 800, color: "var(--gray-950)", letterSpacing: "-0.03em" }}
            >
              {step === "credentials" ? "Welcome back" : "Check your email"}
            </h1>
            <p className="text-sm" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.55 }}>
              {step === "credentials"
                ? "Enter your details to continue."
                : `We sent a 6-digit code to ${maskEmail(email)}. It expires in 10 minutes.`}
            </p>
          </div>

          {/* Dev-only code preview (no Resend key configured) */}
          {step === "code" && devCode && (
            <div
              className="flex items-start gap-2.5 text-sm rounded-2xl px-4 py-3"
              style={{ background: "#fff8ec", border: "1px solid #ffe6c4", color: "#9a5b13", fontFamily: "var(--font-body)", fontSize: "0.8rem", lineHeight: 1.5 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>
                Dev mode — your code is <strong>{devCode}</strong> (set <code>RESEND_API_KEY</code> in .env to email it instead).
              </span>
            </div>
          )}

          {error && (
            <div
              className="flex items-start gap-2.5 text-sm rounded-2xl px-4 py-3"
              role="alert"
              style={{ background: "#fff1f1", border: "1px solid #ffd9d9", color: "#b42318", fontFamily: "var(--font-body)", fontSize: "0.8rem", lineHeight: 1.5 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {step === "credentials" ? (
            <form key="form-credentials" onSubmit={requestCode} className="flex flex-col gap-4" noValidate style={{ animation: "ffFadeUp 0.45s ease both" }}>
              <div>
                <label htmlFor="login-email" className="block mb-1.5" style={labelStyle}>
                  Email address
                </label>
                <div className="relative">
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)", pointerEvents: "none" }}
                    aria-hidden="true"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="m2 7 10 6 10-6" />
                  </svg>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ ...inputStyle, paddingLeft: 40 }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block mb-1.5" style={labelStyle}>
                  Password
                </label>
                <div className="relative">
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)", pointerEvents: "none" }}
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingLeft: 40, paddingRight: 42 }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", padding: 4, cursor: "pointer",
                      color: "var(--gray-500)", display: "flex",
                    }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        <path d="m1 1 22 22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="group flex items-center justify-center gap-2 w-full disabled:opacity-70"
                style={{
                  marginTop: 4,
                  padding: "0.85rem 1.5rem",
                  borderRadius: 9999,
                  border: "none",
                  cursor: busy ? "wait" : "pointer",
                  background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))",
                  color: "#fff",
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  boxShadow: "0 12px 26px -12px rgba(0,167,157,0.65)",
                  transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!busy) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 16px 32px -12px rgba(0,167,157,0.75)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 12px 26px -12px rgba(0,167,157,0.65)"; }}
              >
                {busy ? (
                  <>
                    <span className="animate-spin" style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff" }} />
                    Sending code…
                  </>
                ) : (
                  <>
                    Continue
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form key="form-code" onSubmit={verifyCode} className="flex flex-col gap-4" noValidate style={{ animation: "ffFadeUp 0.45s ease both" }}>
              <div>
                <label htmlFor="login-code" className="block mb-1.5" style={labelStyle}>
                  Verification code
                </label>
                <input
                  id="login-code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase())}
                  placeholder="ABC123"
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    letterSpacing: "0.42em",
                    textIndent: "0.42em",
                    paddingBlock: "0.95rem",
                    fontFamily: "var(--font-heading)",
                    background: "#ffffff",
                    borderColor: "var(--ff-200)",
                  }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="group flex items-center justify-center gap-2 w-full disabled:opacity-70"
                style={{
                  marginTop: 4,
                  padding: "0.85rem 1.5rem",
                  borderRadius: 9999,
                  border: "none",
                  cursor: busy ? "wait" : "pointer",
                  background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))",
                  color: "#fff",
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  boxShadow: "0 12px 26px -12px rgba(0,167,157,0.65)",
                  transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!busy) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 16px 32px -12px rgba(0,167,157,0.75)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 12px 26px -12px rgba(0,167,157,0.65)"; }}
              >
                {busy ? (
                  <>
                    <span className="animate-spin" style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff" }} />
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify &amp; sign in
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between gap-3" style={{ marginTop: 2 }}>
                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setError(""); }}
                  className="flex items-center gap-1"
                  style={{ ...quietBtn, color: "var(--gray-500)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M11 18l-6-6 6-6" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => requestCode()}
                  disabled={busy}
                  style={{ ...quietBtn, color: "var(--ff-500)", opacity: busy ? 0.6 : 1 }}
                >
                  Resend code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
