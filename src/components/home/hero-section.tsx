import Link from "next/link";
import { ArrowRight, FileText, Box, Wind, Activity, Bot, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { ENGINEER } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface via-background to-surface/50 py-16 lg:py-24">
      {/* Background Engineering Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-4xl space-y-6">
          {/* Engineering Identity Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-mono text-primary">
            <span className="h-2 w-2 rounded-full bg-cae animate-pulse" />
            <span>Industrial &amp; Production Engineering Graduate</span>
            <span className="text-border">|</span>
            <span className="font-semibold">{ENGINEER.brandSubtitle}</span>
          </div>

          {/* Main Title & Stance */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-sans">
              Md. Tanbir Hasan
            </h1>
            <p className="text-xl sm:text-2xl font-mono text-muted tracking-tight">
              Design <span className="text-primary font-bold">·</span> Simulate{" "}
              <span className="text-cae font-bold">·</span> Analyze{" "}
              <span className="text-highlight font-bold">·</span> Build
            </p>
          </div>

          {/* Value Proposition Description */}
          <p className="text-base sm:text-lg text-muted leading-relaxed font-sans max-w-3xl">
            Engineering robust mechanical systems, precision SolidWorks assemblies, and numerical CAE simulations. Translating complex fluid dynamics (ANSYS Fluent) and structural mechanics (ANSYS Mechanical) into verified, production-ready designs and hardware prototypes.
          </p>

          {/* Discipline Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { label: "SolidWorks 3D CAD", icon: Box, color: "border-blue-500/30 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20" },
              { label: "CFD — ANSYS Fluent", icon: Wind, color: "border-cyan-500/30 text-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/20" },
              { label: "FEA — ANSYS Mechanical", icon: Activity, color: "border-amber-500/30 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20" },
              { label: "Robotics & PID Control", icon: Bot, color: "border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20" },
              { label: "GD&T & Tolerance Analysis", icon: ShieldCheck, color: "border-purple-500/30 text-purple-600 bg-purple-50/50 dark:bg-purple-950/20" },
            ].map((d, i) => {
              const Icon = d.icon;
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-medium ${d.color}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {d.label}
                </span>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Button asChild size="lg" className="h-11 font-mono text-xs gap-2 bg-primary text-white hover:bg-primary/90 px-6">
              <Link href="/work">
                Explore Engineering Work
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 font-mono text-xs gap-2 border-border hover:bg-slate-50">
              <Link href="/work?category=cfd">
                <Wind className="h-4 w-4 text-cae" />
                View Simulations
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-11 font-mono text-xs gap-2 text-muted hover:text-foreground">
              <Link href="/cv">
                <FileText className="h-4 w-4" />
                Download CV
              </Link>
            </Button>
          </div>

          {/* Engineering Key Metrics Strip */}
          <div className="pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-surface p-3.5">
              <div className="font-mono text-xs font-semibold text-muted uppercase">CAD Standard</div>
              <div className="mt-1 font-mono text-lg font-bold text-foreground">ASME Y14.5</div>
              <div className="text-[11px] text-muted">GD&amp;T &amp; Assembly Fits</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3.5">
              <div className="font-mono text-xs font-semibold text-muted uppercase">CFD Solvers</div>
              <div className="mt-1 font-mono text-lg font-bold text-cae">ANSYS Fluent</div>
              <div className="text-[11px] text-muted">Multiphase VOF &amp; k-ω SST</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3.5">
              <div className="font-mono text-xs font-semibold text-muted uppercase">FEA Analysis</div>
              <div className="mt-1 font-mono text-lg font-bold text-highlight">Static &amp; Cyclic</div>
              <div className="text-[11px] text-muted">Von Mises &amp; FOS Validation</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3.5">
              <div className="font-mono text-xs font-semibold text-muted uppercase">Hardware</div>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">PID Robotics</div>
              <div className="text-[11px] text-muted">Closed-Loop Prototyping</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
