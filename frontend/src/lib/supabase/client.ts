import { createBrowserClient } from "@supabase/ssr";

const THIRTY_DAYS = 60 * 60 * 24 * 30; // 2592000 seconds

function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("remember_me") !== "false";
}

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: getRememberMe() ? THIRTY_DAYS : undefined,
      },
    }
  );
