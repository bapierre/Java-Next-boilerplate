import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect("/dashboard");
    }
  }

  redirect("/auth/login?error=oauth_failed");
}
