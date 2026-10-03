import Link from "next/link";
import { BookOpen, ExternalLink, FileDown, Layers, Search, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedResearch } from "@/lib/data";

export const metadata = {
  title: "Academic Research & Publications | Md. Tanbir Hasan",
  description:
    "Engineering research investigations, technical monographs, and publications in multiphase CFD, structural FEA optimization, and intelligent manufacturing by Md. Tanbir Hasan.",
};

export const revalidate = 60;

export default async function ResearchPage() {
  const researchPapers = await getPublishedResearch();

  const researchInterests = [
    { title: "Multiphase Hydrodynamics & VOF", desc: "Transient wave-structure interaction, slamming impact pressures, and free-surface numerical tracking." },
    { title: "Coupled FEA-CFD & FSI", desc: "Fluid-structure interaction modeling in high-pressure hydraulic components and flow-induced vibrations." },
    { title: "Physics-Informed Optimization", desc: "CAD design optimization leveraging surrogate models and computational engineering pipelines." },
    { title: "Intelligent Manufacturing & Mechatronics", desc: "Sensor fusion, closed-loop PID control, and vision-guided automated inspection systems." },
  ];

  return (
    <div className="py-12 lg:py-16">
      <Container className="space-y-12">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            <span>// Academic &amp; Applied Investigations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
            Research &amp; Technical Publications
          </h1>
          <p className="text-sm text-muted leading-relaxed font-sans">
            Numerical investigations and research working papers focused on computational fluid dynamics, structural mechanics, and automated engineering analysis.
          </p>
        </div>

        {/* Core Research Interests Grid */}
        <div className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
              Primary Research Directions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {researchInterests.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-surface p-5 space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">0{idx + 1}.</span>
                  <h3 className="font-sans text-sm font-bold text-foreground">{item.title}</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Research Papers List */}
        <div className="space-y-6">
          <div className="border-b border-border pb-2 flex items-center justify-between">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
              Publications &amp; Working Papers ({researchPapers.length})
            </h2>
            <span className="font-mono text-[11px] text-muted">Zero fabrication policy applied</span>
          </div>

          {researchPapers.length > 0 ? (
            <div className="space-y-6">
              {researchPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-primary font-semibold">
                        {paper.venue || "Technical Working Paper"}
                      </span>
                      {paper.year && <span>({paper.year})</span>}
                    </div>
                    {paper.doi && (
                      <span className="text-[11px] text-muted">DOI: {paper.doi}</span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-foreground font-sans">
                    {paper.title}
                  </h3>

                  <div className="font-mono text-xs text-muted">
                    <span className="font-semibold text-foreground">Authors: </span>
                    {paper.authors.join(", ")}
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[11px] font-semibold uppercase text-muted">Abstract:</span>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
                      {paper.abstract}
                    </p>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {paper.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-foreground font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Links / Download buttons */}
                  {(paper.pdfUrl || paper.externalUrl) && (
                    <div className="pt-3 border-t border-border flex items-center gap-3">
                      {paper.pdfUrl && (
                        <a
                          href={paper.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-foreground hover:border-primary transition-colors"
                        >
                          <FileDown className="h-3.5 w-3.5 text-primary" />
                          <span>Download Paper (PDF)</span>
                        </a>
                      )}
                      {paper.externalUrl && (
                        <a
                          href={paper.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
                        >
                          <span>Publisher / Repository Link</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-12 text-center font-mono text-xs text-muted">
              No public research papers published yet.
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
