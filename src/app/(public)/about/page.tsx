import Link from "next/link";
import { User, Mail, FileText, CheckCircle2, Award, Box, Wind, Activity, Bot, ArrowRight } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/icons";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminProfile, getSkills } from "@/lib/data";
import { ENGINEER } from "@/lib/constants";

export const metadata = {
  title: "About Md. Tanbir Hasan | Mechanical Design & CAE Engineer",
  description:
    "Technical background, engineering philosophy, and core proficiencies of Md. Tanbir Hasan in Mechanical Design, SolidWorks, CFD, FEA, and Prototyping.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const [profile, skills] = await Promise.all([
    getAdminProfile(),
    getSkills(),
  ]);

  // Group skills by category
  const skillsByGroup = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  const groupLabels: Record<string, string> = {
    mechanical_design_cad: "Mechanical Design & 3D CAD",
    cae_simulation: "CAE & Numerical Simulation (CFD / FEA)",
    robotics_mechatronics: "Robotics & Mechatronics",
    computational_engineering: "Computational Engineering & Data Analysis",
  };

  return (
    <div className="py-12 lg:py-16">
      <Container className="space-y-16">
        {/* Header Block */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
            <User className="h-3.5 w-3.5" />
            <span>// Engineering Profile &amp; Background</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-sans">
            Md. Tanbir Hasan
          </h1>
          <p className="text-lg font-mono text-cae">
            {ENGINEER.title}
          </p>
        </div>

        {/* Narrative & Philosophy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Technical Bio (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6 text-sm sm:text-base text-muted leading-relaxed font-sans">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
                Engineering Discipline &amp; Academic Background
              </h2>
              <p>
                I hold a degree in <span className="font-semibold text-foreground">Industrial &amp; Production Engineering</span>, combining fundamental manufacturing processes, quality systems, and mechanical principles with modern numerical engineering workflows.
              </p>
              <p>
                My professional identity centers squarely on <span className="font-semibold text-foreground">Mechanical Design and CAE Simulation</span>. I focus on taking complex physical problems from conceptual CAD packaging through multi-physics finite element analysis (FEA) and computational fluid dynamics (CFD), culminating in verified physical prototypes.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
                Core Methodology: Design · Simulate · Analyze · Build
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary">
                    <Box className="h-4 w-4" />
                    <span>01. CAD &amp; DFM</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Parametric SolidWorks modeling, kinematic assembly constraints, and GD&amp;T drafting conforming strictly to ASME Y14.5 standards.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-cae">
                    <Wind className="h-4 w-4" />
                    <span>02. Multiphysics CAE</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    ANSYS Fluent CFD (multiphase VOF, turbulence) and ANSYS Mechanical FEA (stress, strain, cyclic fatigue, and bolt pretension).
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-500">
                    <Activity className="h-4 w-4" />
                    <span>03. Numerical Rigor</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Mesh independence sensitivity, residual convergence monitoring, and quantitative verification against experimental benchmarks.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-500">
                    <Bot className="h-4 w-4" />
                    <span>04. Prototyping</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Hands-on fabrication, CNC turning/milling, 3D printing, sensor instrumentation, and microcontroller closed-loop feedback testing.
                  </p>
                </div>
              </div>
            </div>

            {/* Supporting AI/ML Role */}
            <div className="rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
                Supporting Capabilities: Computational Engineering &amp; Python
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Python, OpenCV, and applied machine learning serve strictly as analytical tools — automating simulation parameter sweeps, vision-based quality inspection, and numerical data processing. They enhance engineering capability without displacing mechanical fundamentals.
              </p>
            </div>
          </div>

          {/* Quick Contact & Info Card (Right col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-sm">
              <div className="space-y-2">
                <span className="font-mono text-[11px] font-semibold uppercase text-muted">Direct Contact</span>
                <div className="font-sans text-sm font-bold text-foreground">{ENGINEER.fullName}</div>
                <div className="font-mono text-xs text-primary">{ENGINEER.email}</div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <span className="font-mono text-[11px] font-semibold uppercase text-muted">Location &amp; Availability</span>
                <div className="text-xs text-foreground font-sans">Open to mechanical design consulting, CAE simulation projects, and engineering roles.</div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <span className="font-mono text-[11px] font-semibold uppercase text-muted">Links &amp; Profiles</span>
                <div className="flex flex-col gap-2">
                  <a
                    href={ENGINEER.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-xs text-muted hover:text-primary transition-colors"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                    <span>LinkedIn Profile</span>
                  </a>
                  <a
                    href={`mailto:${ENGINEER.email}`}
                    className="flex items-center gap-2 font-mono text-xs text-muted hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Inquiries</span>
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full font-mono text-xs gap-2 bg-primary text-white">
                  <Link href="/cv">
                    <FileText className="h-4 w-4" />
                    Download Complete CV
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Technical Skill Inventory */}
        <div className="space-y-6">
          <div className="border-b border-border pb-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
              Technical Skill Inventory &amp; Competencies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(skillsByGroup).map(([group, list]) => (
              <div key={group} className="rounded-xl border border-border bg-surface p-6 space-y-3">
                <h3 className="font-sans text-sm font-bold text-foreground">
                  {groupLabels[group] || group}
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {list.map((s) => (
                    <span
                      key={s.id}
                      className="rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-mono text-xs text-foreground font-medium"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
