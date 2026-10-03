"use client";

import { useState } from "react";
import { Award, ExternalLink, Calendar, ShieldCheck, X, ZoomIn } from "lucide-react";
import type { Credential } from "@/types/credentials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CredentialsClientProps {
  credentials: Credential[];
}

export function CredentialsClient({ credentials }: CredentialsClientProps) {
  const [activeCred, setActiveCred] = useState<Credential | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map((cred) => (
          <div
            key={cred.id}
            onClick={() => setActiveCred(cred)}
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-md cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-[10px] uppercase text-cae border-cae/30">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {cred.badgeType}
                </Badge>
                {cred.issueDate && (
                  <span className="font-mono text-xs text-muted">
                    {cred.issueDate.slice(0, 7)}
                  </span>
                )}
              </div>

              <h3 className="font-sans text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {cred.title}
              </h3>

              <p className="font-mono text-xs text-muted">
                {cred.issuer}
              </p>

              {cred.credentialId && (
                <div className="rounded bg-slate-50 dark:bg-slate-900 px-2 py-1 font-mono text-[11px] text-muted border border-border/50">
                  ID: <span className="font-semibold text-foreground">{cred.credentialId}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between font-mono text-xs text-primary">
              <span className="flex items-center gap-1 group-hover:underline">
                <ZoomIn className="h-3.5 w-3.5" />
                Inspect Certificate
              </span>
              {cred.verificationUrl && (
                <span className="text-muted hover:text-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Inspection Modal */}
      {activeCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setActiveCred(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs uppercase text-cae border-cae/30">
                {activeCred.badgeType}
              </Badge>
              <span className="font-mono text-xs text-muted">Issued: {activeCred.issueDate || "N/A"}</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
                {activeCred.title}
              </h2>
              <p className="font-mono text-sm text-primary mt-1 font-medium">
                {activeCred.issuer}
              </p>
            </div>

            {/* Certificate Preview Placeholder / Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              {activeCred.imageUrl ? (
                <img
                  src={activeCred.imageUrl}
                  alt={activeCred.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="space-y-3">
                  <Award className="h-12 w-12 text-primary mx-auto" />
                  <div className="font-mono text-sm font-bold text-slate-100">
                    {activeCred.title}
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    Issuer: {activeCred.issuer}
                  </div>
                  {activeCred.credentialId && (
                    <div className="font-mono text-[11px] text-cyan-400">
                      Credential ID: {activeCred.credentialId}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {activeCred.verificationUrl ? (
                <a
                  href={activeCred.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  <span>Verify Credential on Issuer Site</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="font-mono text-xs text-muted">
                  Official Verification ID: {activeCred.credentialId || "On File"}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveCred(null)}
                className="font-mono text-xs"
              >
                Close Viewport
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
