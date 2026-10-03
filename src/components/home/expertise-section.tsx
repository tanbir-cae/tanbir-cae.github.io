import { Box, Wind, Activity, Bot, Terminal, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

export function ExpertiseSection() {
  const pillars = [
    {
      id: "cad",
      number: "01",
      title: "Mechanical Design & CAD",
      subtitle: "SolidWorks · Assemblies · GD&T",
      icon: Box,
      accent: "border-blue-500/20 bg-blue-50/10 hover:border-blue-500/40",
      iconColor: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
      capabilities: [
        "Parametric 3D CAD modeling of complex mechanical components",
        "Multi-part SolidWorks assemblies with motion & mate constraints",
        "Engineering drawings conforming to ASME Y14.5 GD&T standards",
        "Design for Manufacturing (DFM) for CNC machining & 3D printing",
        "Tolerance stack-up analysis (worst-case and statistical fits)",
      ],
      tools: ["SolidWorks", "ASME Y14.5", "DFM", "Tolerance Stack-up", "KeyShot"],
    },
    {
      id: "cae",
      number: "02",
      title: "CAE & Numerical Simulation",
      subtitle: "ANSYS Fluent (CFD) · ANSYS Mechanical (FEA)",
      icon: Wind,
      accent: "border-cyan-500/20 bg-cyan-50/10 hover:border-cyan-500/40",
      iconColor: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10",
      capabilities: [
        "CFD multiphase flow simulations (VOF, free-surface hydrodynamic impact)",
        "Static structural, deformation, and von Mises stress FEA",
        "Polyhedral & hexcore mesh generation with boundary layer inflation",
        "k-ω SST, k-ε turbulence modeling and convergence monitoring",
        "Mesh independence verification studies and experimental correlation",
      ],
      tools: ["ANSYS Fluent", "ANSYS Mechanical", "SpaceClaim", "VOF Multiphase", "Mesh Metrics"],
    },
    {
      id: "robotics",
      number: "03",
      title: "Robotics & Mechatronics",
      subtitle: "Microcontrollers · Feedback Control · Prototypes",
      icon: Bot,
      accent: "border-emerald-500/20 bg-emerald-50/10 hover:border-emerald-500/40",
      iconColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      capabilities: [
        "Embedded control systems design using Arduino & microcontrollers",
        "Optical, ultrasonic, and inertial sensor array integration",
        "Closed-loop PID velocity and trajectory control implementation",
        "Pneumatic and electromechanical actuator integration",
        "Rapid hardware prototyping, bench testing, and data logging",
      ],
      tools: ["Arduino", "PID Control", "Embedded C++", "Pneumatics", "Sensors"],
    },
    {
      id: "computational",
      number: "04",
      title: "Computational Engineering",
      subtitle: "Python · Computer Vision · Industrial AI (Secondary)",
      icon: Terminal,
      accent: "border-slate-500/20 bg-slate-50/10 hover:border-slate-500/40",
      iconColor: "text-slate-600 dark:text-slate-400 bg-slate-500/10",
      capabilities: [
        "Engineering data processing & numerical calculations with NumPy/SciPy",
        "Computer vision inspection algorithms using OpenCV",
        "Applied machine learning models for engineering parameter regression",
        "Automated simulation post-processing and figure plotting pipelines",
      ],
      tools: ["Python", "OpenCV", "NumPy", "Matplotlib", "Automation"],
    },
  ];

  return (
    <section className="py-16 lg:py-24 border-b border-border bg-surface">
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
            <span>// Engineering Competencies</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
            Core Technical Expertise
          </h2>
          <p className="text-sm text-muted leading-relaxed font-sans">
            Disciplined execution across mechanical drafting, multiphysics CAE simulation, robotics, and computational tooling. Computational AI is maintained strictly as an analytical supporting capability.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-2xl border p-6 lg:p-8 transition-all duration-300 hover:shadow-lg ${p.accent}`}
              >
                {/* Pillar Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${p.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-sans text-lg font-bold text-foreground">{p.title}</h3>
                      <p className="font-mono text-xs text-muted">{p.subtitle}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-muted/60">{p.number}</span>
                </div>

                {/* Capabilities list */}
                <div className="my-4 flex-1 space-y-2.5">
                  {p.capabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-muted font-sans leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-cae flex-shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>

                {/* Tool Pills */}
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
                  {p.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] text-foreground font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
