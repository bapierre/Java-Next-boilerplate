"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProjectList from "@/components/dashboard/ProjectList";

export default function DashboardContent({ email }: { email: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <ProjectList email={email} onSignOut={handleSignOut} />
      </div>
    </div>
  );
}
