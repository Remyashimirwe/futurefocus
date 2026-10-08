import Link from "next/link";
import type { Metadata } from "next";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overview — Admin" };

type Stats = {
  total: number;
  fresh: number;
  accepted: number;
  gallery: number;
};

type RecentApplication = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  course: string | null;
  status: string;
  created_at: Date;
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  new:       { bg: "var(--ff-100)", color: "var(--ff-700)", label: "New" },
  reviewing: { bg: "#fff4e5", color: "#b54708", label: "Reviewing" },
  accepted:  { bg: "#e6f4ea", color: "#137333", label: "Accepted" },
  rejected:  { bg: "#fdecea", color: "#b42318", label: "Rejected" },
};

export default async function AdminOverviewPage() {
  const stats = await queryOne<Stats>(`
    SELECT
      (SELECT count(*) FROM applications)::int AS total,
      (SELECT count(*) FROM applications WHERE status = 'new')::int AS fresh,
      (SELECT count(*) FROM applications WHERE status = 'accepted')::int AS accepted,
      (SELECT count(*) FROM gallery_images)::int AS gallery
  `);

  const recent = await query<RecentApplication>(
    `SELECT id, first_name, last_name, email, course, status, created_at
       FROM applications
      ORDER BY created_at DESC
      LIMIT 5`
  );

  const cards = [
    { label: "Total Applications", value: stats?.total ?? 0, hint: "All time", accent: "var(--ff-700)" },
    { label: "New Applications", value: stats?.fresh ?? 0, hint: "Awaiting review", accent: "var(--ff-500)" },
    { label: "Accepted Students", value: stats?.accepted ?? 0, hint: "Offer accepted", accent: "#137333" },
    { label: "Gallery Images", value: stats?.gallery ?? 0, hint: "Uploaded to Cloudinary", accent: "#b54708" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 bg-white"
            style={{ border: "1px solid var(--gray-100)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--gray-500)", fontFamily: "var(--font-heading)" }}>
              {card.label}
            </p>
            <p className="text-3xl font-extrabold mt-2 tabular-nums" style={{ color: card.accent, fontFamily: "var(--font-heading)" }}>
              {card.value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--gray-500)" }}>{card.hint}</p>
          </div>
        ))}
      </div>

      {/* Recent applications */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid var(--gray-100)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--gray-100)" }}>
          <h2 className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
            Recent Applications
          </h2>
          <Link
            href="/admin/applications"
            className="text-xs font-semibold"
            style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={{ color: "var(--gray-500)" }}>
              No applications yet. Submissions from the Apply page will appear here.
            </p>
          </div>
        ) : (
          <ul role="list" className="divide-y" style={{ borderColor: "var(--gray-100)" }}>
            {recent.map((app) => {
              const style = STATUS_STYLES[app.status] ?? STATUS_STYLES.new;
              return (
                <li key={app.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                      {app.first_name} {app.last_name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--gray-500)" }}>
                      {app.email}{app.course ? ` · ${app.course}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: style.bg, color: style.color, fontFamily: "var(--font-heading)" }}
                    >
                      {style.label}
                    </span>
                    <span className="text-xs hidden sm:inline" style={{ color: "var(--gray-500)" }}>
                      {new Date(app.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
