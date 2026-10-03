"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { error: null };

export function LoginForm({ configured }: { configured: boolean }) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin/dashboard";
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={!configured || pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={!configured || pending}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-highlight" role="alert">
          {state.error}
        </p>
      ) : null}
      {!configured ? (
        <p className="text-sm text-muted">
          Configure Supabase environment variables before signing in.
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={!configured || pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
