import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminPanel from "@/components/dashboard/AdminPanel";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: string;
  projectCount: number;
  channelCount: number;
  lastSyncedAt: string | null;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/dashboard");
  }

  const users: AdminUser[] = await res.json();

  return <AdminPanel initialUsers={users} />;
}
