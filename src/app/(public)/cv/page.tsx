import Link from "next/link";
import { FileText, Download, Printer, ArrowLeft, Mail, MapPin, ExternalLink } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/icons";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ENGINEER } from "@/lib/constants";
import { getPublishedProjects, getPublishedCredentials, getPublishedResearch } from "@/lib/data";

export const metadata = {
  title: "Curriculum Vitae | Md. Tanbir Hasan",
  description:
    "Curriculum Vitae of Md. Tanbir Hasan — Mechanical Design & CAE Engineer. Industrial & Production Engineering background.",
};

export const revalidate = 60;

export default async function CvPage() {
  const [projects, credentials, research] = await Promise.all([
    getPublishedProjects(),
    getPublishedCredentials(),
    getPublishedResearch(),
  ]);

  return (
    <div className="py-12 lg:py-16">
      <Container className="max-w-4xl space-y-8">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 print:hidden">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Portfolio</span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={`mailto:${ENGINEER.email}?subject=Requesting%20Official%20CV%20PDF`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-foreground hover:border-primary transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Request PDF Document</span>
            </a>
          </div>
        </div>

        {/* CV Document Container */}
        <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12 shadow-sm space-y-10 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b border-border pb-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Md. Tanbir Hasan
            </h1>
            <p className="font-mono text-base font-semibold text-primary">
              Mechanical Design &amp; CAE Engineer
            </p>
            <p className="text-xs sm:text-sm text-muted font-sans max-w-2xl leading-relaxed">
              Industrial &amp; Production Engineering graduate specializing in 3D CAD modeling, multi-physics CFD/FEA numerical simulations, and prototype validation.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 font-mono text-xs text-muted">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-primary" />
                {ENGINEER.email}
              </span>
              <a
                href={ENGINEER.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <LinkedinIcon className="h-3.5 w-3.5 text-blue-600" />
                linkedin.com/in/tanbir-hasan
              </a>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                Dhaka, Bangladesh
              </span>
            </div>
          </div>

          {/* Education */}
          <section className="space-y-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
              01 // Education &amp; Academic Background
            </h2>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between font-sans text-sm font-bold text-foreground">
                <span>B.Sc. in Industrial &amp; Production Engineering</span>
                <span className="font-mono text-xs font-normal text-muted">Engineering Degree</span>
              </div>
              <p className="text-xs text-muted font-sans leading-relaxed">
                Curriculum focused on mechanical drafting, machine design, thermo-fluid mechanics, manufacturing processes, operations research, and statistical quality control.
              </p>
            </div>
          </section>

          {/* Technical Competencies */}
          <section className="space-y-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
              02 // Technical Competencies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1 rounded-xl border border-border p-3.5">
                <span className="font-mono text-[11px] font-bold text-foreground uppercase">Mechanical Design &amp; CAD</span>
                <p className="text-muted leading-relaxed">SolidWorks 3D Modeling, Assemblies, GD&amp;T (ASME Y14.5), Tolerance Stack-up, DFM, KeyShot.</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border p-3.5">
                <span className="font-mono text-[11px] font-bold text-cae uppercase">CAE &amp; Numerical Simulation</span>
                <p className="text-muted leading-relaxed">ANSYS Fluent (Multiphase VOF, Turbulence), ANSYS Mechanical (Static Structural, Fatigue, Stress FEA), Mesh Independence.</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border p-3.5">
                <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Robotics &amp; Mechatronics</span>
                <p className="text-muted leading-relaxed">Arduino, Microcontrollers, Closed-Loop PID Control, Sensor Integration, Actuators, Rapid Prototyping.</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border p-3.5">
                <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">Computational Engineering</span>
                <p className="text-muted leading-relaxed">Python, NumPy, SciPy, OpenCV (Computer Vision), Data Analysis, Simulation Automation Pipelines.</p>
              </div>
            </div>
          </section>

          {/* Featured Case Studies */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
              03 // Featured Engineering Projects
            </h2>
            <div className="space-y-4 divide-y divide-border">
              {projects.slice(0, 3).map((p) => (
                <div key={p.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between text-xs font-sans">
                    <span className="font-bold text-foreground">{p.title}</span>
                    <span className="font-mono text-[11px] text-muted">{p.year || "2024"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-primary">
                    <span>Tools: {p.software.join(", ")}</span>
                  </div>
                  <p className="text-xs text-muted font-sans leading-relaxed">
                    {p.summary}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Research & Publications */}
          {research.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                04 // Research Publications
              </h2>
              <div className="space-y-3">
                {research.map((r) => (
                  <div key={r.id} className="space-y-1 text-xs">
                    <div className="font-bold text-foreground font-sans">{r.title}</div>
                    <div className="font-mono text-[11px] text-muted">
                      {r.authors.join(", ")} · {r.venue || "Working Paper"} ({r.year})
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Credentials */}
          {credentials.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                05 // Certifications &amp; Credentials
              </h2>
              <div className="space-y-2">
                {credentials.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{c.title} — {c.issuer}</span>
                    <span className="font-mono text-muted">{c.issueDate?.slice(0, 4)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
