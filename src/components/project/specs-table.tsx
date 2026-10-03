import { Ruler, ShieldAlert, Cpu, Hammer, Thermometer, Weight } from "lucide-react";
import type { DesignSpecs } from "@/types/project";

interface SpecsTableProps {
  specs: DesignSpecs | null;
  className?: string;
}

export function SpecsTable({ specs, className = "" }: SpecsTableProps) {
  if (!specs) return null;

  const items = [
    {
      label: "Envelope & Key Dimensions",
      value: specs.dimensions,
      icon: Ruler,
      color: "text-blue-500",
    },
    {
      label: "Material Specification",
      value: specs.materials,
      icon: ShieldAlert,
      color: "text-emerald-500",
    },
    {
      label: "Operating Conditions & Environment",
      value: specs.operatingConditions,
      icon: Thermometer,
      color: "text-amber-500",
    },
    {
      label: "Applied Load Cases",
      value: specs.loads,
      icon: Weight,
      color: "text-rose-500",
    },
    {
      label: "Engineering Constraints",
      value: specs.constraints,
      icon: Cpu,
      color: "text-cyan-500",
    },
    {
      label: "DFM & Manufacturing Process",
      value: specs.manufacturingConsiderations,
      icon: Hammer,
      color: "text-indigo-500",
    },
  ].filter((item) => Boolean(item.value));

  if (items.length === 0) return null;

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-surface shadow-sm ${className}`}>
      <div className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 px-5 py-3.5">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
          Design Specifications &amp; Operational Constraints
        </h3>
      </div>
      <div className="divide-y divide-border">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-start p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:w-1/3 flex-shrink-0">
                <Icon className={`h-4 w-4 ${item.color} flex-shrink-0`} />
                <span className="font-mono text-xs font-medium text-foreground">{item.label}</span>
              </div>
              <div className="sm:w-2/3 text-xs leading-relaxed text-muted font-sans">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
