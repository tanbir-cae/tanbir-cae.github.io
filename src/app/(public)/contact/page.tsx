import { Mail, Clock, MapPin, Send } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/icons";
import { Container } from "@/components/layout/container";
import { ContactForm } from "./contact-form";
import { ENGINEER } from "@/lib/constants";

export const metadata = {
  title: "Contact & Technical Inquiries | Md. Tanbir Hasan",
  description:
    "Get in touch with Md. Tanbir Hasan for mechanical design consulting, SolidWorks CAD modeling, ANSYS CFD/FEA simulations, and engineering collaboration.",
};

export default function ContactPage() {
  return (
    <div className="py-12 lg:py-16">
      <Container className="space-y-12">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
            <Mail className="h-3.5 w-3.5" />
            <span>// Direct Communication</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
            Get in Touch
          </h1>
          <p className="text-sm text-muted leading-relaxed font-sans">
            Available for technical consultation, 3D CAD modeling, multi-physics CFD/FEA analysis, and prospective engineering opportunities.
          </p>
        </div>

        {/* Form and Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Contact Form (Left 2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
                Send an Engineering Message
              </h2>
              <p className="text-xs text-muted mt-1 font-sans">
                Fill in the details below with your engineering specifications or inquiries.
              </p>
            </div>

            <ContactForm />
          </div>

          {/* Contact Details & Direct Methods (Right col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-sm">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                Direct Channels
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted uppercase">Email</div>
                    <a
                      href={`mailto:${ENGINEER.email}`}
                      className="font-mono text-xs font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {ENGINEER.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 flex-shrink-0">
                    <LinkedinIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted uppercase">Professional Network</div>
                    <a
                      href={ENGINEER.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-medium text-foreground hover:text-primary transition-colors"
                    >
                      linkedin.com/in/tanbir-hasan
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 flex-shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted uppercase">Response Time</div>
                    <div className="text-xs text-foreground font-sans">Typically within 24–48 hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cae/10 text-cae flex-shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted uppercase">Location</div>
                    <div className="text-xs text-foreground font-sans">Dhaka, Bangladesh · Remote Worldwide</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/50 p-5 space-y-2">
              <span className="font-mono text-[11px] font-semibold text-foreground uppercase">Confidentiality Note</span>
              <p className="text-[11px] text-muted leading-relaxed font-sans">
                Proprietary CAD files and sensitive numerical simulation datasets shared for review are treated with strict confidentiality. Non-disclosure agreements (NDAs) supported upon request.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
