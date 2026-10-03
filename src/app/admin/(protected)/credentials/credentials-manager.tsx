"use client";

import { useState } from "react";
import { Plus, Edit3, Trash2, X, Save, Award, ExternalLink } from "lucide-react";
import type { Credential } from "@/types/credentials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { saveCredentialAction, deleteCredentialAction } from "@/lib/cms/actions";
import { CREDENTIAL_BADGE_TYPES } from "@/types/enums";

export function CredentialsManager({ initialCredentials }: { initialCredentials: Credential[] }) {
  const [creds, setCreds] = useState(initialCredentials);
  const [editingCred, setEditingCred] = useState<Credential | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this credential?")) return;
    setCreds((prev) => prev.filter((c) => c.id !== id));
    await deleteCredentialAction(id);
  };

  const handleClose = () => {
    setEditingCred(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <span className="font-mono text-xs text-muted">
          Showing {creds.length} certifications &amp; training qualifications
        </span>
        <Button onClick={() => setIsCreating(true)} size="sm" className="font-mono text-xs gap-1.5 bg-primary text-white">
          <Plus className="h-3.5 w-3.5" />
          Add Credential
        </Button>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {creds.map((cred) => (
          <div key={cred.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-sm font-bold text-foreground truncate">{cred.title}</span>
                <Badge variant="outline" className="font-mono text-[9px] uppercase">
                  {cred.badgeType}
                </Badge>
                {cred.issueDate && <span className="font-mono text-[10px] text-muted">{cred.issueDate}</span>}
              </div>
              <div className="font-mono text-xs text-muted">
                Issuer: <span className="text-foreground">{cred.issuer}</span>
                {cred.credentialId && <span> · ID: {cred.credentialId}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => setEditingCred(cred)} className="h-8 font-mono text-xs border-border">
                <Edit3 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <button onClick={() => handleDelete(cred.id)} className="p-1.5 text-muted hover:text-rose-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isCreating || editingCred) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-xl rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6">
            <button onClick={handleClose} className="absolute right-4 top-4 p-1.5 text-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold font-sans">
                {editingCred ? "Edit Credential Details" : "Add Professional Credential"}
              </h2>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                await saveCredentialAction(formData);
                setIsSubmitting(false);
                handleClose();
              }}
              className="space-y-4"
            >
              {editingCred && <input type="hidden" name="id" value={editingCred.id} />}

              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-mono text-xs">Credential Title *</Label>
                <Input id="title" name="title" required defaultValue={editingCred?.title} placeholder="Certified SolidWorks Professional (CSWP)" className="text-xs" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="issuer" className="font-mono text-xs">Issuer Organization</Label>
                  <Input id="issuer" name="issuer" defaultValue={editingCred?.issuer || ""} placeholder="Dassault Systèmes" className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="badgeType" className="font-mono text-xs">Badge Type</Label>
                  <select id="badgeType" name="badgeType" defaultValue={editingCred?.badgeType || "certification"} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono">
                    {CREDENTIAL_BADGE_TYPES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="issueDate" className="font-mono text-xs">Issue Date</Label>
                  <Input id="issueDate" name="issueDate" type="date" defaultValue={editingCred?.issueDate || ""} className="text-xs font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="credentialId" className="font-mono text-xs">Credential ID / Code</Label>
                  <Input id="credentialId" name="credentialId" defaultValue={editingCred?.credentialId || ""} placeholder="C-SWP-ENG-2023" className="text-xs font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="verificationUrl" className="font-mono text-xs">Public Verification Link</Label>
                <Input id="verificationUrl" name="verificationUrl" defaultValue={editingCred?.verificationUrl || ""} placeholder="https://..." className="text-xs font-mono" />
              </div>

              <div className="flex items-center gap-2 pt-2 font-mono text-xs">
                <input type="checkbox" id="published" name="published" defaultChecked={editingCred ? editingCred.published : true} className="h-4 w-4 rounded accent-primary" />
                <Label htmlFor="published">Published to public website</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" type="button" onClick={handleClose} className="font-mono text-xs">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="font-mono text-xs gap-1.5 bg-primary text-white">
                  <Save className="h-3.5 w-3.5" />
                  {isSubmitting ? "Saving..." : "Save Credential"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
