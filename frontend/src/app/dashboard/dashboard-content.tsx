"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ProjectList from "@/components/dashboard/ProjectList";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function DashboardContent({ email }: { email: string }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/check`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <ProjectList email={email} onSignOut={handleSignOut} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
