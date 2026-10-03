import { redirect } from "next/navigation";
import { isAllowlistedAdminEmail, isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAdminSession() {
  const user = await getAuthUser();
  if (!user || !isAllowlistedAdminEmail(user.email)) {
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const user = await getAdminSession();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
