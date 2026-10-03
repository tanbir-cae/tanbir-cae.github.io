"use server";

import { redirect } from "next/navigation";
import { isAllowlistedAdminEmail, isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
};

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/dashboard");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (!isAllowlistedAdminEmail(email)) {
    return { error: "This account is not authorized for CMS access." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Sign-in failed. Check the email and password." };
  }

  const safeNext = next.startsWith("/admin") ? next : "/admin/dashboard";
  redirect(safeNext as any);
}

export async function logoutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
