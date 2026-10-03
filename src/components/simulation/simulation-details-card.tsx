import { Cpu, Wind, Layers, Compass, CheckCircle2, FlaskConical } from "lucide-react";
import type { SimulationDetails } from "@/types/project";
import { Badge } from "@/components/ui/badge";

interface SimulationDetailsCardProps {
  details: SimulationDetails | null;
  className?: string;
}

export function SimulationDetailsCard({ details, className = "" }: SimulationDetailsCardProps) {
  if (!details) return null;

  const cards = [
    {
      label: "Solver & Scheme",
      value: details.solver,
      icon: Cpu,
      accent: "border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300",
    },
    {
      label: "Physics & Multiphase",
      value: details.physics,
      icon: Wind,
      accent: "border-cyan-500/20 bg-cyan-50/30 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300",
    },
    {
      label: "Turbulence Model",
      value: details.turbulenceModel,
      icon: FlaskConical,
      accent: "border-purple-500/20 bg-purple-50/30 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300",
    },
    {
      label: "Mesh Density & Metrics",
      value: details.mesh,
      icon: Layers,
      accent: "border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Boundary Conditions",
      value: details.boundaryConditions,
      icon: Compass,
      accent: "border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
    },
    {
      label: "Load Cases & Verification",
      value: details.loadCases,
      icon: CheckCircle2,
      accent: "border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300",
    },
  ].filter((c) => Boolean(c.value));

  if (cards.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
          Numerical Simulation &amp; Solver Setup
        </h3>
        <Badge variant="outline" className="font-mono text-[10px] text-cae">
          ANSYS / Numerical Physics
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 transition-all hover:shadow-sm ${c.accent}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-mono text-xs font-semibold">{c.label}</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90 font-sans">
                {c.value}
              </p>
            </div>
          );
        })}
      </div>

      {details.material && (
        <div className="rounded-xl border border-border bg-surface p-4 text-xs font-mono text-muted">
          <span className="font-semibold text-foreground">Material Constitutive Properties: </span>
          {details.material}
        </div>
      )}
    </div>
  );
}
