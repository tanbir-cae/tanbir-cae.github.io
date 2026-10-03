"use client";

import { useActionState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContactMessage, type ContactFormState } from "@/lib/contact/actions";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/10 p-8 text-center space-y-4 animate-in fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-sans text-xl font-bold text-foreground">
          Message Transmitted Successfully
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
          Thank you for reaching out. Your engineering inquiry has been received and I will review the technical details shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-50/10 p-3 text-xs text-rose-500">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="font-mono text-xs text-muted">
            Full Name <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Dr. / Eng. Jane Doe"
            className="text-xs bg-surface"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="font-mono text-xs text-muted">
            Email Address <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="name@organization.com"
            className="text-xs bg-surface"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject" className="font-mono text-xs text-muted">
          Inquiry Type / Subject
        </Label>
        <Input
          id="subject"
          name="subject"
          placeholder="e.g. CFD Simulation Review, CAD Assembly Consulting, Recruitment"
          className="text-xs bg-surface"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message" className="font-mono text-xs text-muted">
          Technical Message / Scope of Work <span className="text-rose-500">*</span>
        </Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Describe your technical challenge, operating parameters, required CAD/CFD deliverables, or timeline..."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-sans text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto font-mono text-xs gap-2 bg-primary text-white hover:bg-primary/90"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Transmitting...
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            Send Inquiry
          </>
        )}
      </Button>
    </form>
  );
}
