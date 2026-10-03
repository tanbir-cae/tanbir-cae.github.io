const REQUIRED_PUBLIC = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

export type ServerSupabaseEnv = PublicSupabaseEnv & {
  serviceRoleKey?: string;
  adminEmails: string[];
};

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
  const url = read("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function requirePublicSupabaseEnv(): PublicSupabaseEnv {
  const env = getPublicSupabaseEnv();
  if (!env) {
    throw new Error(
      `Missing ${REQUIRED_PUBLIC.join(" and ")}. Copy .env.example to .env.local.`,
    );
  }
  return env;
}

export function getAdminEmails(): string[] {
  const raw = read("ADMIN_EMAILS") ?? read("ADMIN_EMAIL") ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlistedAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const allowlist = getAdminEmails();
  if (allowlist.length === 0) return false;
  return allowlist.includes(email.toLowerCase());
}

export function getServiceRoleKey(): string | undefined {
  return read("SUPABASE_SERVICE_ROLE_KEY");
}

export function isSupabaseConfigured(): boolean {
  return getPublicSupabaseEnv() !== null;
}
