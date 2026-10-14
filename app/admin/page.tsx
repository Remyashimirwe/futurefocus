import Link from "next/link";
import type { Metadata } from "next";
import { query, queryOne } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overview — Admin" };

type Stats = {
  total: number;
  fresh: number;
  reviewing: number;
  accepted: number;
  rejected: number;
  gallery: number;
  published: number;
  drafts: number;
  week: number;
  prev_week: number;
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

const cardBase: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid var(--gray-100)",
  boxShadow:
    "0 1px 2px rgba(0,61,56,0.04), 0 22px 44px -30px rgba(0,61,56,0.45)",
};

const panelBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow:
    "0 1px 2px rgba(0,61,56,0.04), 0 26px 52px -34px rgba(0,61,56,0.5)",
};

function timeAgo(value: Date): string {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function Icon({ path, size = 18 }: { path: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

const ICONS = {
  total: <><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></>,
  fresh: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></>,
  accepted: <><path d="M20 6L9 17l-5-5" /></>,
  gallery: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
};

export default async function AdminOverviewPage() {
  const session = await auth();

  const stats = await queryOne<Stats>(`
    SELECT
      (SELECT count(*) FROM applications)::int AS total,
      (SELECT count(*) FROM applications WHERE status = 'new')::int AS fresh,
      (SELECT count(*) FROM applications WHERE status = 'reviewing')::int AS reviewing,
      (SELECT count(*) FROM applications WHERE status = 'accepted')::int AS accepted,
      (SELECT count(*) FROM applications WHERE status = 'rejected')::int AS rejected,
      (SELECT count(*) FROM gallery_images)::int AS gallery,
      (SELECT count(*) FROM programs WHERE published = true)::int AS published,
      (SELECT count(*) FROM programs WHERE published = false)::int AS drafts,
      (SELECT count(*) FROM applications
        WHERE created_at > now() - interval '7 days')::int AS week,
      (SELECT count(*) FROM applications
        WHERE created_at > now() - interval '14 days'
          AND created_at <= now() - interval '7 days')::int AS prev_week
  `);

  const recent = await query<RecentApplication>(
    `SELECT id, first_name, last_name, email, course, status, created_at
       FROM applications
      ORDER BY created_at DESC
      LIMIT 5`
  );

  const total = stats?.total ?? 0;
  const week = stats?.week ?? 0;
  const prevWeek = stats?.prev_week ?? 0;

  let trend: { label: string; tone: "up" | "down" | "flat" };
  if (week > 0 && prevWeek === 0) {
    trend = { label: `${week} new this week`, tone: "up" };
  } else if (prevWeek === 0) {
    trend = { label: "No change", tone: "flat" };
  } else {
    const delta = Math.round(((week - prevWeek) / prevWeek) * 100);
    if (delta > 0) trend = { label: `+${delta}% this week`, tone: "up" };
    else if (delta < 0) trend = { label: `${delta}% this week`, tone: "down" };
    else trend = { label: "No change", tone: "flat" };
  }

  const trendStyle = {
    up:   { background: "#e6f4ea", color: "#137333" },
    down: { background: "#fdecea", color: "#b42318" },
    flat: { background: "var(--gray-100)", color: "var(--gray-500)" },
  }[trend.tone];

  const cards = [
    { label: "Total applications", value: total, hint: "All time", icon: ICONS.total,
      iconBg: "linear-gradient(135deg, var(--ff-500), var(--ff-700))", iconColor: "#fff",
      chip: trend, chipStyle: trendStyle },
    { label: "Awaiting review", value: stats?.fresh ?? 0, hint: "Status: new", icon: ICONS.fresh,
      iconBg: "var(--ff-100)", iconColor: "var(--ff-700)", chip: null, chipStyle: null },
    { label: "Accepted students", value: stats?.accepted ?? 0, hint: "Offers accepted", icon: ICONS.accepted,
      iconBg: "#e6f4ea", iconColor: "#137333", chip: null, chipStyle: null },
    { label: "Gallery photos", value: stats?.gallery ?? 0, hint: "On Cloudinary", icon: ICONS.gallery,
      iconBg: "#fff4e5", iconColor: "#b54708", chip: null, chipStyle: null },
  ];

  const pipeline = [
    { key: "new", ...STATUS_STYLES.new, count: stats?.fresh ?? 0 },
    { key: "reviewing", ...STATUS_STYLES.reviewing, count: stats?.reviewing ?? 0 },
    { key: "accepted", ...STATUS_STYLES.accepted, count: stats?.accepted ?? 0 },
    { key: "rejected", ...STATUS_STYLES.rejected, count: stats?.rejected ?? 0 },
  ];

  const quickActions = [
    { href: "/admin/applications", label: "Review applications", hint: `${stats?.fresh ?? 0} awaiting`, icon: ICONS.fresh },
    { href: "/admin/publish", label: "Publish a program", hint: `${stats?.drafts ?? 0} draft${(stats?.drafts ?? 0) === 1 ? "" : "s"}`, icon: ICONS.arrow },
    { href: "/admin/gallery", label: "Manage gallery", hint: `${stats?.gallery ?? 0} photos`, icon: ICONS.gallery },
    { href: "/", label: "View public site", hint: "Opens in this tab", icon: ICONS.arrow },
  ];

  const firstName =
    session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* ── Greeting ─────────────────────────────────────── */}
      <div
        className="rounded-3xl px-6 py-6 sm:px-7 sm:py-7 relative overflow-hidden"
        style={{
          background: "linear-gradient(120deg, #003d38 0%, #005850 55%, #00706b 100%)",
          boxShadow: "0 26px 50px -34px rgba(0,61,56,0.9)",
          animation: "ffFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(420px 200px at 88% -30%, rgba(79,205,196,0.45), transparent 70%), radial-gradient(300px 180px at 8% 130%, rgba(255,255,255,0.14), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-heading)" }}>
              Control panel
            </p>
            <h2 className="mt-1.5 text-2xl sm:text-[1.7rem] font-extrabold text-white" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}>
              {greeting}, {firstName}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
              {(stats?.fresh ?? 0) > 0
                ? `You have ${stats?.fresh} application${stats?.fresh === 1 ? "" : "s"} waiting for review.`
                : total > 0
                  ? "No new applications right now — everything is up to date."
                  : "Submissions from the Apply page will show up here."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/applications"
              className="text-xs font-bold px-4 py-2.5 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-heading)",
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              Applications
            </Link>
            <Link
              href="/admin/publish"
              className="text-xs font-bold px-4 py-2.5 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-heading)",
                background: "#fff",
                color: "var(--ff-800)",
                boxShadow: "0 12px 26px -14px rgba(0,0,0,0.7)",
              }}
            >
              + New publish
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="rounded-3xl p-5 transition-transform duration-200 hover:-translate-y-1"
            style={{
              ...cardBase,
              animation: `ffFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${0.06 * (i + 1)}s both`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: card.iconBg,
                  color: card.iconColor,
                  boxShadow: i === 0 ? "0 10px 22px -12px rgba(0,167,157,0.8)" : "none",
                }}
              >
                <Icon path={card.icon} />
              </span>
              {card.chip && (
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{ ...card.chipStyle, fontFamily: "var(--font-heading)" }}
                >
                  {card.chip.label}
                </span>
              )}
            </div>
            <p className="text-[32px] leading-none font-extrabold mt-4 tabular-nums" style={{ color: "var(--gray-950)", fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}>
              {card.value}
            </p>
            <p className="text-xs font-semibold mt-2" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>
              {card.label}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--gray-500)" }}>{card.hint}</p>
          </div>
        ))}
      </div>

      {/* ── Recent + side panels ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent applications */}
        <section
          className="lg:col-span-2 rounded-3xl overflow-hidden"
          style={{ ...panelBase, animation: "ffFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.24s both" }}
        >
          <div className="flex items-center justify-between px-5 sm:px-6 py-4" style={{ borderBottom: "1px solid var(--gray-100)" }}>
            <div>
              <h2 className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
                Recent applications
              </h2>
              <p className="text-[11px]" style={{ color: "var(--gray-500)" }}>
                The latest {recent.length === 1 ? "submission" : `submissions`} from your site
              </p>
            </div>
            <Link
              href="/admin/applications"
              className="group inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-colors duration-200"
              style={{ fontFamily: "var(--font-heading)", background: "var(--ff-50)", color: "var(--ff-700)" }}
            >
              View all
              <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div
                className="mx-auto h-12 w-12 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--ff-100)", color: "var(--ff-700)" }}
                aria-hidden="true"
              >
                <Icon path={<><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /></>} size={20} />
              </div>
              <p className="text-sm font-bold mt-4" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                No applications yet
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--gray-500)" }}>
                Submissions from the Apply page will appear here.
              </p>
            </div>
          ) : (
            <ul role="list" className="divide-y" style={{ borderColor: "var(--gray-100)" }}>
              {recent.map((app, i) => {
                const style = STATUS_STYLES[app.status] ?? STATUS_STYLES.new;
                const tints = ["var(--ff-100)", "#e8f1ff", "#fff4e5", "#f3ecff", "#e6f4ea"];
                return (
                  <li
                    key={app.id}
                    className="flex items-center justify-between gap-4 px-5 sm:px-6 py-3.5 transition-colors duration-150 hover:bg-[var(--ff-50)]"
                    style={{ animation: `ffFadeUp 0.4s ease ${0.28 + i * 0.05}s both` }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
                        style={{
                          background: tints[i % tints.length],
                          color: "var(--ff-800)",
                          fontFamily: "var(--font-heading)",
                        }}
                        aria-hidden="true"
                      >
                        {initials(app.first_name, app.last_name)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                          {app.first_name} {app.last_name}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--gray-500)" }}>
                          {app.email}{app.course ? ` · ${app.course}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: style.bg, color: style.color, fontFamily: "var(--font-heading)" }}
                      >
                        {style.label}
                      </span>
                      <span className="text-xs w-[70px] text-right hidden sm:inline" style={{ color: "var(--gray-500)" }}>
                        {timeAgo(app.created_at)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Side column */}
        <div className="space-y-5">
          {/* Pipeline */}
          <section
            className="rounded-3xl p-5"
            style={{ ...panelBase, animation: "ffFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}
          >
            <h2 className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
              Application pipeline
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--gray-500)" }}>
              {total === 0 ? "Nothing to break down yet" : `${total} application${total === 1 ? "" : "s"} in total`}
            </p>

            {total > 0 && (
              <>
                <div
                  className="mt-4 h-2.5 w-full rounded-full overflow-hidden flex"
                  style={{ background: "var(--gray-100)" }}
                  role="img"
                  aria-label={pipeline.map((p) => `${p.label}: ${p.count}`).join(", ")}
                >
                  {pipeline.map((p) => (
                    <span
                      key={p.key}
                      style={{
                        width: `${(p.count / total) * 100}%`,
                        background: p.key === "new" ? "var(--ff-500)" : p.key === "reviewing" ? "#f5a524" : p.key === "accepted" ? "#22a06b" : "#e5484d",
                        transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                  ))}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {pipeline.map((p) => (
                    <li key={p.key} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2" style={{ color: "var(--gray-700)" }}>
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: p.key === "new" ? "var(--ff-500)" : p.key === "reviewing" ? "#f5a524" : p.key === "accepted" ? "#22a06b" : "#e5484d" }}
                          aria-hidden="true"
                        />
                        {p.label}
                      </span>
                      <span className="font-extrabold tabular-nums" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                        {p.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-4 pt-3 flex items-center justify-between text-[11px]" style={{ borderTop: "1px solid var(--gray-100)" }}>
              <span style={{ color: "var(--gray-500)" }}>Programs published</span>
              <span className="font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                {stats?.published ?? 0}
                <span style={{ color: "var(--gray-300)" }}> / {(stats?.published ?? 0) + (stats?.drafts ?? 0)}</span>
              </span>
            </div>
          </section>

          {/* Quick actions */}
          <section
            className="rounded-3xl p-5"
            style={{ ...panelBase, animation: "ffFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.36s both" }}
          >
            <h2 className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
              Quick actions
            </h2>
            <div className="mt-3 space-y-1.5">
              {quickActions.map((action) => (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors duration-150 hover:bg-[var(--ff-50)]"
                >
                  <span
                    className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150"
                    style={{ background: "var(--gray-100)", color: "var(--ff-700)" }}
                  >
                    <Icon path={action.icon} size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold truncate" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                      {action.label}
                    </span>
                    <span className="block text-[11px]" style={{ color: "var(--gray-500)" }}>
                      {action.hint}
                    </span>
                  </span>
                  <span
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
                    style={{ color: "var(--ff-500)" }}
                    aria-hidden="true"
                  >
                    <Icon path={ICONS.arrow} size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
