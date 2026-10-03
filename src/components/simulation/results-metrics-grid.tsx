import { Activity, Gauge, ShieldCheck, Zap, Thermometer, Waves, CheckCircle2 } from "lucide-react";
import type { SimulationResults } from "@/types/project";

interface ResultsMetricsGridProps {
  results: SimulationResults | null;
  className?: string;
}

export function ResultsMetricsGrid({ results, className = "" }: ResultsMetricsGridProps) {
  if (!results) return null;

  const metrics = [
    {
      label: "Von Mises Stress",
      value: results.stress,
      icon: Activity,
      color: "text-rose-500",
      bg: "border-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20",
    },
    {
      label: "Elastic Deformation",
      value: results.deformation,
      icon: Gauge,
      color: "text-amber-500",
      bg: "border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20",
    },
    {
      label: "Factor of Safety",
      value: results.factorOfSafety,
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20",
    },
    {
      label: "Fluid Velocity & Jet Run-up",
      value: results.velocity,
      icon: Zap,
      color: "text-cyan-500",
      bg: "border-cyan-500/20 bg-cyan-50/20 dark:bg-cyan-950/20",
    },
    {
      label: "Static & Dynamic Pressure",
      value: results.pressure,
      icon: Activity,
      color: "text-blue-500",
      bg: "border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20",
    },
    {
      label: "Thermal / Temperature Field",
      value: results.temperature,
      icon: Thermometer,
      color: "text-orange-500",
      bg: "border-orange-500/20 bg-orange-50/20 dark:bg-orange-950/20",
    },
    {
      label: "VOF Interface / Multiphase",
      value: results.volumeFraction,
      icon: Waves,
      color: "text-teal-500",
      bg: "border-teal-500/20 bg-teal-50/20 dark:bg-teal-950/20",
    },
    {
      label: "Solver Residual Convergence",
      value: results.residuals,
      icon: CheckCircle2,
      color: "text-indigo-500",
      bg: "border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20",
    },
  ].filter((m) => Boolean(m.value));

  if (metrics.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-border pb-2">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
          Engineering Simulation &amp; Validation Results
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 transition-all ${m.bg}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`h-4 w-4 ${m.color}`} />
                <span className="font-mono text-xs font-semibold text-foreground">
                  {m.label}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted font-sans">
                {m.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
