import Link from "next/link";
import { CadViewer } from "@/components/cad/cad-viewer";
import { ContourSlider } from "@/components/simulation/contour-slider";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Box, SlidersHorizontal } from "lucide-react";

export function VisualizationSection() {
  return (
    <section id="cad-preview" className="py-16 lg:py-24 border-b border-border bg-gradient-to-b from-background to-surface">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-cae">
              <Box className="h-3.5 w-3.5" />
              <span>// Interactive Engineering Viewports</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
              3D CAD &amp; Simulation Visualization
            </h2>
            <p className="text-sm text-muted leading-relaxed font-sans">
              Direct in-browser inspection of mechanical models and multi-physics CFD contours. Rotate, explode, and evaluate engineering geometry without specialized software.
            </p>
          </div>
          <Link
            href="/work/planetary-gearbox-assembly"
            className="flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:text-cae transition-colors"
          >
            <span>View Full Gearbox Study</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 3D CAD Viewer Viewport */}
        <div className="space-y-4 mb-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 font-mono text-xs text-blue-600 dark:text-blue-400">
                SOLIDWORKS ASSEMBLY
              </Badge>
              <span className="font-mono text-xs font-semibold text-foreground">
                Epicyclic Planetary Reduction Drive (4:1 Ratio)
              </span>
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-muted">
              Use mouse / touch to orbit, pan, &amp; zoom
            </span>
          </div>

          <CadViewer
            assemblyName="Epicyclic Planetary Gearbox Assembly"
            nativeFileName="planetary_gearbox_assembly.sldasm"
            nativeDownloadUrl="/models/planetary_gearbox_assembly.sldasm"
            autoRotate={false}
          />
        </div>

        {/* CFD Contour Comparison Slider */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 font-mono text-xs text-cyan-600 dark:text-cyan-400">
                CFD MULTIPHASE VOF
              </Badge>
              <span className="font-mono text-xs font-semibold text-foreground">
                Wave Impact on Vertical Seawall: Stagnation Pressure vs Fluid Jet Velocity
              </span>
            </div>
            <Link
              href="/work/wave-impact-vertical-wall"
              className="flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:text-cae transition-colors"
            >
              <span>Explore CFD Simulation Details</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ContourSlider
            beforeImage="/images/cfd-pressure-contour.svg"
            afterImage="/images/cfd-velocity-contour.svg"
            beforeLabel="Dynamic Pressure (kPa)"
            afterLabel="Velocity Magnitude (m/s)"
            beforeSubtitle="Peak Slamming Pressure: 48.6 kPa"
            afterSubtitle="Peak Fluid Jet Ejection: 4.82 m/s"
          />
        </div>
      </Container>
    </section>
  );
}
