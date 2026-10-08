import type { Metadata } from "next";
import { query } from "@/lib/db";
import ApplicationsTable from "./ApplicationsTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Applications — Admin" };

type Row = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  course: string | null;
  schedule: string | null;
  delivery_mode: string | null;
  status: string;
  created_at: Date;
};

export default async function ApplicationsPage() {
  const rows = await query<Row>(
    `SELECT id, first_name, last_name, email, phone, course, schedule, delivery_mode, status, created_at
       FROM applications
      ORDER BY created_at DESC`
  );

  const initial = rows.map((row) => ({
    id: row.id,
    name: `${row.first_name} ${row.last_name}`,
    email: row.email,
    phone: row.phone,
    course: row.course,
    schedule: row.schedule,
    deliveryMode: row.delivery_mode,
    status: row.status,
    date: new Date(row.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
          People who applied
        </h2>
        <p className="text-sm" style={{ color: "var(--gray-500)" }}>
          {initial.length === 0
            ? "No applications yet."
            : `${initial.length} application${initial.length === 1 ? "" : "s"} received.`}
        </p>
      </div>

      <ApplicationsTable initial={initial} />
    </div>
  );
}
