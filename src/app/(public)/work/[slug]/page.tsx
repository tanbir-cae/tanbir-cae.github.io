import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Box,
  Wind,
  Activity,
  Bot,
  Cpu,
  FileDown,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CadViewer } from "@/components/cad/cad-viewer";
import { ContourSlider } from "@/components/simulation/contour-slider";
import { SpecsTable } from "@/components/project/specs-table";
import { SimulationDetailsCard } from "@/components/simulation/simulation-details-card";
import { ResultsMetricsGrid } from "@/components/simulation/results-metrics-grid";
import { getProjectWithAssets, getPublishedProjects } from "@/lib/data";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";

export const revalidate = 60;

interface CaseStudyProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CaseStudyProps) {
  const { slug } = await params;
  const project = await getProjectWithAssets(slug);
  if (!project) return { title: "Case Study Not Found" };

  return {
    title: `${project.title} | Md. Tanbir Hasan`,
    description: project.summary,
  };
}

export default async function CaseStudyPage({ params }: CaseStudyProps) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([
    getProjectWithAssets(slug),
    getPublishedProjects(),
  ]);

  if (!project) {
    notFound();
  }

  // Find previous and next projects for navigation
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cad":
        return <Box className="h-3.5 w-3.5 mr-1" />;
      case "cfd":
        return <Wind className="h-3.5 w-3.5 mr-1" />;
      case "fea":
        return <Activity className="h-3.5 w-3.5 mr-1" />;
      case "robotics":
        return <Bot className="h-3.5 w-3.5 mr-1" />;
      default:
        return <Cpu className="h-3.5 w-3.5 mr-1" />;
    }
  };

  return (
    <article className="py-12 lg:py-16">
      <Container className="space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link
            href="/work"
            className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Work Archive</span>
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="capitalize">{CATEGORY_LABELS[project.category] || project.category}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">{project.year || "2024"}</span>
          </div>
        </div>

        {/* Project Header Block */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs uppercase text-primary border-primary/30">
              {getCategoryIcon(project.category)}
              {CATEGORY_LABELS[project.category] || project.category}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs capitalize text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              {STATUS_LABELS[project.status] || project.status}
            </Badge>
            {project.featured && (
              <Badge variant="outline" className="border-highlight/30 text-highlight font-mono text-xs">
                Featured Case Study
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-sans">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-muted font-sans max-w-4xl">
            {project.summary}
          </p>

          {/* Software & Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-muted uppercase">Software Stack:</span>
              {project.software.map((sw, i) => (
                <span
                  key={i}
                  className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-mono text-xs font-semibold text-foreground"
                >
                  {sw}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {project.tags.map((t, i) => (
                <span key={i} className="font-mono text-[11px] text-muted">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* 01 — Problem Statement & Objective */}
        {project.sectionsEnabled?.problemStatement && project.problemStatement && (
          <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
              <span>// 01 — Problem Statement &amp; Engineering Objective</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Context &amp; Design Challenges
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-muted font-sans whitespace-pre-line">
              {project.problemStatement}
            </p>
          </section>
        )}

        {/* 02 — Design Specifications & Constraints */}
        {project.sectionsEnabled?.designSpecs && project.designSpecs && (
          <section className="space-y-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
              <span>// 02 — Specifications &amp; Operating Constraints</span>
            </div>
            <SpecsTable specs={project.designSpecs} />
          </section>
        )}

        {/* 03 — Interactive 3D CAD Assembly Viewer (if enabled or category is CAD) */}
        {(project.sectionsEnabled?.cadViewer || project.category === "cad") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-cae">
                <Box className="h-3.5 w-3.5" />
                <span>// 03 — 3D CAD Geometry &amp; Assembly Inspection</span>
              </div>
              <span className="font-mono text-xs text-muted">SolidWorks WebGL Viewport</span>
            </div>

            <CadViewer
              modelUrl={project.cadModelUrl}
              modelFormat={project.cadFormat}
              assemblyName={project.title}
              nativeFileName={`${project.slug}.${project.cadFormat || "sldasm"}`}
              nativeDownloadUrl={project.cadModelUrl}
            />
          </section>
        )}

        {/* 04 — Numerical Simulation Setup (CFD / FEA) */}
        {project.sectionsEnabled?.simulationSetup && project.simulationDetails && (
          <section className="space-y-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
              <span>// 04 — Numerical Simulation Setup &amp; Solver Physics</span>
            </div>
            <SimulationDetailsCard details={project.simulationDetails} />
          </section>
        )}

        {/* 05 — Interactive Contour Comparison Slider (if enabled or has CFD/FEA contour assets) */}
        {(project.sectionsEnabled?.contourComparison || project.category === "cfd" || project.category === "fea") && (
          <section className="space-y-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-cae">
              <Wind className="h-3.5 w-3.5" />
              <span>// 05 — Contour Comparison &amp; Field Distribution</span>
            </div>

            <ContourSlider
              beforeImage={
                project.category === "fea"
                  ? "/images/fea-stress-contour.svg"
                  : "/images/cfd-pressure-contour.svg"
              }
              afterImage={
                project.category === "fea"
                  ? "/images/fea-deformation-contour.svg"
                  : "/images/cfd-velocity-contour.svg"
              }
              beforeLabel={
                project.category === "fea"
                  ? "Von Mises Stress (MPa)"
                  : "Hydrodynamic Pressure (kPa)"
              }
              afterLabel={
                project.category === "fea"
                  ? "Elastic Deformation (mm)"
                  : "Velocity Vectors (m/s)"
              }
              beforeSubtitle={
                project.category === "fea"
                  ? "Peak notch stress: 242.8 MPa"
                  : "Dynamic stagnation: 48.6 kPa"
              }
              afterSubtitle={
                project.category === "fea"
                  ? "Total displacement: 0.048 mm"
                  : "Jet run-up velocity: 4.82 m/s"
              }
            />
          </section>
        )}

        {/* 06 — Engineering Results & Numerical Metrics */}
        {project.sectionsEnabled?.resultsMetrics && project.results && (
          <section className="space-y-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
              <span>// 06 — Engineering Results &amp; Quantitative Metrics</span>
            </div>
            <ResultsMetricsGrid results={project.results} />
          </section>
        )}

        {/* Project Technical Drawing Sheets & Assets Gallery */}
        {project.assets && project.assets.length > 0 && (
          <section className="space-y-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
              <Layers className="h-3.5 w-3.5" />
              <span>// Technical Drawings, Renders &amp; Asset Evidence</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                    <img
                      src={asset.fileUrl || ""}
                      alt={asset.caption || asset.title || "Engineering Drawing"}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  {asset.caption && (
                    <div className="border-t border-border p-3.5 bg-slate-50/50 dark:bg-slate-900/50 font-mono text-xs text-muted">
                      {asset.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 07 — Validation & Benchmarks */}
        {(project.validation || project.validationSummary) && (
          <section className="space-y-3 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>// 07 — Validation, Convergence &amp; Benchmarking</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground font-sans">
              Experimental &amp; Numerical Verification
            </h3>
            <p className="text-sm leading-relaxed text-muted font-sans whitespace-pre-line">
              {project.validation || project.validationSummary}
            </p>
          </section>
        )}

        {/* 08 — Conclusion & Key Findings */}
        {project.conclusion && (
          <section className="space-y-3 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <span>// 08 — Technical Conclusions &amp; Findings</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground font-sans">
              Summary of Engineering Takeaways
            </h3>
            <p className="text-sm leading-relaxed text-muted font-sans whitespace-pre-line">
              {project.conclusion}
            </p>
          </section>
        )}

        {/* Bottom Navigation: Prev & Next Case Studies */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {prevProject ? (
            <Link
              href={`/work/${prevProject.slug}`}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface p-4 hover:border-primary transition-all w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 text-muted" />
              <div className="text-left">
                <div className="font-mono text-[10px] text-muted uppercase">Previous Case Study</div>
                <div className="font-sans text-xs font-bold text-foreground line-clamp-1">{prevProject.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextProject && (
            <Link
              href={`/work/${nextProject.slug}`}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface p-4 hover:border-primary transition-all w-full sm:w-auto sm:ml-auto"
            >
              <div className="text-right">
                <div className="font-mono text-[10px] text-muted uppercase">Next Case Study</div>
                <div className="font-sans text-xs font-bold text-foreground line-clamp-1">{nextProject.title}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>
          )}
        </div>
      </Container>
    </article>
  );
}
