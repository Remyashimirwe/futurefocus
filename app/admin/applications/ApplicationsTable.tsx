"use client";

import { useEffect, useState } from "react";
import Modal from "@/app/components/Modal";

export type ApplicationRow = {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  country?: string | null;
  course: string | null;
  schedule: string | null;
  deliveryMode: string | null;
  status: string;
  date: string;
  createdAt?: string;
};

const STATUSES = [
  { value: "new", label: "New", bg: "var(--ff-100)", color: "var(--ff-700)", dot: "#00a79d" },
  { value: "reviewing", label: "Reviewing", bg: "#fff4e5", color: "#b54708", dot: "#f5a524" },
  { value: "accepted", label: "Accepted", bg: "#e6f4ea", color: "#137333", dot: "#22c55e" },
  { value: "rejected", label: "Rejected", bg: "#fdecea", color: "#b42318", dot: "#ef4444" },
];

const statusMeta = (value: string) => STATUSES.find((s) => s.value === value) ?? STATUSES[0];

/** Gradient for the initials avatar — varies by index so rows feel distinct. */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, var(--ff-400), var(--ff-700))",
  "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  "linear-gradient(135deg, #a855f7, #7e22ce)",
  "linear-gradient(135deg, #f5a524, #b54708)",
  "linear-gradient(135deg, #ec4899, #be185d)",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/** Floating confirmation toast — success fades away on its own, errors stay. */
function Toast({ message, onClose }: { message: { type: "ok" | "error"; text: string }; onClose: () => void }) {
  const ok = message.type === "ok";
  return (
    <div
      role={ok ? "status" : "alert"}
      className="fixed bottom-5 right-5 z-[70] flex items-start gap-3 max-w-[calc(100vw-2.5rem)] sm:max-w-md rounded-2xl py-3 pl-3.5 pr-3"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        border: `1px solid ${ok ? "#c3e6cb" : "#ffd7d7"}`,
        boxShadow: "0 24px 50px -20px rgba(0,43,39,0.45)",
        animation: "ffCardIn 0.3s ease both",
      }}
    >
      <span
        className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full"
        style={ok ? { background: "#e6f4ea", color: "#137333" } : { background: "#fff1f1", color: "#b42318" }}
        aria-hidden="true"
      >
        {ok ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5M12 16.5v.01" />
          </svg>
        )}
      </span>
      <p className="text-sm leading-snug" style={{ color: ok ? "#137333" : "#b42318" }}>
        {message.text}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 ml-1 rounded-full p-1 cursor-pointer transition-colors duration-200 hover:bg-[var(--gray-100)]"
        style={{ color: "var(--gray-500)" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/** One labelled value in the detail popup. */
function Detail({ label, value, href }: { label: string; value?: string | null; href?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--gray-500)" }}>
        {label}
      </p>
      {href ? (
        <a
          href={href}
          className="mt-0.5 block text-sm font-semibold underline-offset-2 hover:underline"
          style={{ color: "var(--ff-700)", fontFamily: "var(--font-heading)" }}
        >
          {value}
        </a>
      ) : (
        <p className="mt-0.5 text-sm font-semibold break-words" style={{ color: "var(--gray-900)", fontFamily: "var(--font-heading)" }}>
          {value}
        </p>
      )}
    </div>
  );
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "var(--ff-50)", border: "1px solid var(--ff-100)" }}
    >
      <p
        className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: "var(--ff-700)", fontFamily: "var(--font-heading)" }}
      >
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
    </div>
  );
}

export default function ApplicationsTable({ initial }: { initial: ApplicationRow[] }) {
  const [rows, setRows] = useState(initial);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  // Success toasts clear themselves; errors stay until acted on.
  useEffect(() => {
    if (!message || message.type !== "ok") return;
    const timer = window.setTimeout(() => setMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const updateStatus = async (id: number, status: string) => {
    const previous = rows;
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
    setSavingId(id);
    setMessage(null);

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setSavingId(null);
    if (!res.ok) {
      setRows(previous);
      setMessage({ type: "error", text: "Could not update the status. Please try again." });
    } else {
      const name = rows.find((row) => row.id === id)?.name ?? "Application";
      setMessage({ type: "ok", text: `${name} is now “${statusMeta(status).label}”.` });
    }
  };

  const openApplication = rows.find((row) => row.id === openId) ?? null;

  const counts = STATUSES.map((s) => ({
    ...s,
    count: rows.filter((row) => row.status === s.value).length,
  }));

  if (rows.length === 0) {
    return (
      <div
        className="rounded-[26px] px-6 py-14 text-center"
        style={{ background: "rgba(255,255,255,0.7)", border: "1px dashed var(--gray-300)" }}
      >
        <div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "var(--ff-50)", color: "var(--ff-500)", border: "1px solid var(--ff-100)" }}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-700)" }}>
          No applications yet
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--gray-500)" }}>
          When someone submits the Apply form, they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && <Toast message={message} onClose={() => setMessage(null)} />}

      {/* ── Status stat chips ── */}
      <div className="flex flex-wrap gap-2">
        <div
          className="flex items-center gap-2 rounded-full pl-3 pr-3.5 py-1.5"
          style={{
            background: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 6px 16px -12px rgba(0,61,56,0.5)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gray-300)" }} aria-hidden="true" />
          <span className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
            {rows.length}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--gray-500)" }}>
            Total
          </span>
        </div>
        {counts.map((s) => (
          <div
            key={s.value}
            className="flex items-center gap-2 rounded-full pl-3 pr-3.5 py-1.5"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 6px 16px -12px rgba(0,61,56,0.5)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot, boxShadow: `0 0 8px ${s.dot}` }} aria-hidden="true" />
            <span className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
              {s.count}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--gray-500)" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Detail popup ── */}
      <Modal
        open={openApplication !== null}
        onClose={() => setOpenId(null)}
        title={openApplication?.name ?? "Application"}
        subtitle={openApplication ? `Applied ${openApplication.createdAt ?? openApplication.date}` : undefined}
        width="max-w-2xl"
        icon={
          <span className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            {openApplication ? initials(openApplication.name) : ""}
          </span>
        }
      >
        {openApplication && (
          <div className="space-y-4">
            {/* Contact */}
            <DetailGroup title="Contact">
              <Detail label="Email" value={openApplication.email} href={`mailto:${openApplication.email}`} />
              <Detail label="Phone" value={openApplication.phone} href={openApplication.phone ? `tel:${openApplication.phone}` : undefined} />
            </DetailGroup>

            {/* Personal */}
            <DetailGroup title="Personal details">
              <Detail label="Date of birth" value={openApplication.dateOfBirth} />
              <Detail label="Gender" value={openApplication.gender} />
            </DetailGroup>

            {/* Address */}
            <DetailGroup title="Address">
              <Detail label="Street" value={openApplication.streetAddress} />
              <Detail label="City" value={openApplication.city} />
              <Detail label="District" value={openApplication.district} />
              <Detail label="Province / State" value={openApplication.province} />
              <Detail label="Country" value={openApplication.country} />
            </DetailGroup>

            {/* Enrollment */}
            <DetailGroup title="Enrollment">
              <Detail label="Program" value={openApplication.course} />
              <Detail label="Schedule" value={openApplication.schedule} />
              <Detail label="Mode" value={openApplication.deliveryMode} />
            </DetailGroup>

            {/* Status + close */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "var(--gray-500)" }}>
                Status
                <select
                  value={openApplication.status}
                  onChange={(e) => updateStatus(openApplication.id, e.target.value)}
                  disabled={savingId === openApplication.id}
                  aria-label={`Status for ${openApplication.name}`}
                  className="text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer outline-none disabled:opacity-60"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: statusMeta(openApplication.status).bg,
                    color: statusMeta(openApplication.status).color,
                    border: "none",
                  }}
                >
                  {STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
                style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Rows ── */}
      <div className="space-y-3">
        {rows.map((row, index) => {
          const meta = statusMeta(row.status);
          const saving = savingId === row.id;
          return (
            <div
              key={row.id}
              className="rounded-[22px] p-4 transition-shadow duration-300 cursor-pointer hover:shadow-[0_20px_44px_-28px_rgba(0,61,56,0.45)]"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px) saturate(140%)",
                WebkitBackdropFilter: "blur(12px) saturate(140%)",
                border: "1px solid var(--gray-100)",
                boxShadow: "0 2px 10px rgba(0,61,56,0.05)",
              }}
              onClick={() => setOpenId(row.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div
                  className="h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-sm font-extrabold text-white"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
                    boxShadow: "0 8px 18px -8px rgba(0,61,56,0.5)",
                  }}
                  aria-hidden="true"
                >
                  {initials(row.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold truncate" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
                      {row.name}
                    </p>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.dot}40` }}
                    >
                      {meta.label}
                    </span>
                    {saving && (
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--gray-400, #9aa3a3)" }}>
                        Saving…
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--gray-500)" }}>
                    {row.email}
                    {row.phone ? ` · ${row.phone}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
                  {row.course && (
                    <span
                      className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "var(--ff-50)", color: "var(--ff-700)", border: "1px solid var(--ff-100)" }}
                    >
                      {row.course}
                    </span>
                  )}
                  <span className="text-xs whitespace-nowrap" style={{ color: "var(--gray-500)" }}>
                    {row.date}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenId(row.id);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ff-300)] hover:text-[var(--ff-700)]"
                    style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View
                  </button>
                  <select
                    value={row.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateStatus(row.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={saving}
                    aria-label={`Status for ${row.name}`}
                    className="text-xs font-bold px-3 py-2 rounded-full cursor-pointer outline-none disabled:opacity-60"
                    style={{
                      fontFamily: "var(--font-heading)",
                      background: meta.bg,
                      color: meta.color,
                      border: "none",
                    }}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
