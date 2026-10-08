"use client";

import { useState } from "react";

type ApplicationRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  course: string | null;
  schedule: string | null;
  deliveryMode: string | null;
  status: string;
  date: string;
};

const STATUSES = [
  { value: "new", label: "New", bg: "var(--ff-100)", color: "var(--ff-700)" },
  { value: "reviewing", label: "Reviewing", bg: "#fff4e5", color: "#b54708" },
  { value: "accepted", label: "Accepted", bg: "#e6f4ea", color: "#137333" },
  { value: "rejected", label: "Rejected", bg: "#fdecea", color: "#b42318" },
];

const statusMeta = (value: string) => STATUSES.find((s) => s.value === value) ?? STATUSES[0];

export default function ApplicationsTable({ initial }: { initial: ApplicationRow[] }) {
  const [rows, setRows] = useState(initial);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const updateStatus = async (id: number, status: string) => {
    const previous = rows;
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
    setSavingId(id);
    setError("");

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setSavingId(null);
    if (!res.ok) {
      setRows(previous);
      setError("Could not update the status. Please try again.");
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-6 py-14 text-center" style={{ border: "1px solid var(--gray-100)" }}>
        <p className="text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
          No applications yet
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--gray-500)" }}>
          When someone submits the Apply form, they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm rounded-xl px-4 py-2.5" role="alert" style={{ background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }}>
          {error}
        </p>
      )}

      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid var(--gray-100)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gray-100)", background: "var(--ff-50)" }}>
                {["Applicant", "Course", "Schedule", "Mode", "Applied", "Status"].map((head) => (
                  <th
                    key={head}
                    className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--gray-500)", fontFamily: "var(--font-heading)" }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const meta = statusMeta(row.status);
                return (
                  <tr key={row.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                        {row.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--gray-500)" }}>{row.email}</p>
                      {row.phone && <p className="text-xs" style={{ color: "var(--gray-500)" }}>{row.phone}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--gray-700)" }}>
                      {row.course ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--gray-700)" }}>
                      {row.schedule ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--gray-700)" }}>
                      {row.deliveryMode ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: "var(--gray-500)" }}>
                      {row.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={row.status}
                        onChange={(e) => updateStatus(row.id, e.target.value)}
                        disabled={savingId === row.id}
                        aria-label={`Status for ${row.name}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer outline-none disabled:opacity-60"
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
