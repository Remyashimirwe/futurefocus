import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AdminShell
      name={session.user.name ?? "Administrator"}
      email={session.user.email ?? ""}
    >
      {children}
    </AdminShell>
  );
}
