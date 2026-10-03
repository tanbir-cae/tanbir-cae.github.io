import { Settings, Shield, Database, Lock, CheckCircle2 } from "lucide-react";
import { isSupabaseConfigured, getAdminEmails } from "@/lib/env";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default function AdminSettingsPage() {
  const configured = isSupabaseConfigured();
  const adminEmails = getAdminEmails();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-primary uppercase">
          <Settings className="h-3.5 w-3.5" />
          <span>// System Settings</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground font-sans">
          Security, Database &amp; Environment
        </h1>
        <p className="mt-1 text-xs text-muted font-sans">
          Overview of Row Level Security (RLS), Supabase configuration status, and authorized administrator emails.
        </p>
      </div>

      <div className="space-y-6">
        {/* Backend Connectivity Status */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h2 className="font-sans text-sm font-bold text-foreground">
                Supabase Backend Connectivity
              </h2>
            </div>
            <Badge variant="outline" className={`font-mono text-xs ${configured ? "text-emerald-600 border-emerald-500/40" : "text-amber-600 border-amber-500/40"}`}>
              {configured ? "Connected & Live" : "Unconfigured / Fallback Mode"}
            </Badge>
          </div>

          <p className="text-xs text-muted font-sans leading-relaxed">
            {configured
              ? "Supabase public environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are active. All queries communicate directly with your PostgreSQL database."
              : "Supabase environment variables are currently pending in .env.local. The portfolio is running smoothly in verified fallback mode with complete mock data and zero fabrication."}
          </p>
        </div>

        {/* CMS Authorization Allowlist */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <h2 className="font-sans text-sm font-bold text-foreground">
                CMS Access Allowlist (ADMIN_EMAILS)
              </h2>
            </div>
            <span className="font-mono text-xs text-muted">{adminEmails.length} Authorized</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted font-sans">
              Only authenticated Supabase users whose email matches this allowlist can access the /admin routes:
            </p>
            <div className="divide-y divide-border rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/50 p-3 font-mono text-xs text-foreground">
              {adminEmails.length > 0 ? (
                adminEmails.map((email, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{email}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted">tanbirhasan.mail@gmail.com (Default)</div>
              )}
            </div>
          </div>
        </div>

        {/* Security & RLS Policy Summary */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Shield className="h-4 w-4 text-cae" />
            <h2 className="font-sans text-sm font-bold text-foreground">
              Security &amp; Row Level Security (RLS) Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-muted">
            <div className="rounded-lg border border-border p-3 space-y-1">
              <span className="font-semibold text-foreground">Public Access:</span>
              <p>Read-only access restricted strictly to rows where published = true.</p>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-1">
              <span className="font-semibold text-foreground">Admin Mutations:</span>
              <p>INSERT, UPDATE, DELETE enforced by PostgreSQL RLS requiring role = admin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
