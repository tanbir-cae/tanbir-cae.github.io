import { Suspense } from "react";
import { Wordmark } from "@/components/branding/wordmark";
import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/env";

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-full items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8">
        <Wordmark href="/" />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">CMS sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Private administration for portfolio content. This route is not linked in public
          navigation.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-muted">Loading sign-in form…</p>}>
            <LoginForm configured={configured} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
