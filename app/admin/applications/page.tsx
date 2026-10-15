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
  date_of_birth: string | null;
  gender: string | null;
  street_address: string | null;
  city: string | null;
  district: string | null;
  province: string | null;
  country: string | null;
  course: string | null;
  schedule: string | null;
  delivery_mode: string | null;
  status: string;
  created_at: Date;
};

export default async function ApplicationsPage() {
  const rows = await query<Row>(
    `SELECT id, first_name, last_name, email, phone, date_of_birth, gender,
            street_address, city, district, province, country,
            course, schedule, delivery_mode, status, created_at
       FROM applications
      ORDER BY created_at DESC`
  );

  const initial = rows.map((row) => ({
    id: row.id,
    name: `${row.first_name} ${row.last_name}`,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    streetAddress: row.street_address,
    city: row.city,
    district: row.district,
    province: row.province,
    country: row.country,
    course: row.course,
    schedule: row.schedule,
    deliveryMode: row.delivery_mode,
    status: row.status,
    date: new Date(row.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    createdAt: new Date(row.created_at).toLocaleString(undefined, {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
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
            : "Open an application to see everything they submitted via the Apply form."}
        </p>
      </div>

      <ApplicationsTable initial={initial} />
    </div>
  );
}
