import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Award, Mail, FileText, CheckCircle2, Shield } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSection } from "@/components/home/hero-section";
import { ExpertiseSection } from "@/components/home/expertise-section";
import { VisualizationSection } from "@/components/home/visualization-section";
import { ProjectCard } from "@/components/project/project-card";
import { getPublishedProjects, getPublishedResearch, getPublishedCredentials } from "@/lib/data";
import { ENGINEER } from "@/lib/constants";

export const revalidate = 60;

export default async function HomePage() {
  const [featuredProjects, researchList, credentialsList] = await Promise.all([
    getPublishedProjects({ featured: true, limit: 4 }),
    getPublishedResearch(),
    getPublishedCredentials(),
  ]);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Core Expertise */}
      <ExpertiseSection />

      {/* 3. Featured Engineering Work */}
      <section className="py-16 lg:py-24 border-b border-border bg-background">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
                <span>// Featured Case Studies</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
                Selected Engineering Work
              </h2>
              <p className="text-sm text-muted font-sans">
                Rigorous mechanical design, multiphase fluid simulation, and physical mechatronics prototypes.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="font-mono text-xs gap-1.5 border-border">
              <Link href="/work">
                <span>Explore Full Archive ({featuredProjects.length}+)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Engineering Visualization Section (Interactive 3D CAD & Contour Slider) */}
      <VisualizationSection />

      {/* 5. Academic Research & Publications Preview */}
      {researchList.length > 0 && (
        <section className="py-16 lg:py-20 border-b border-border bg-surface">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="max-w-xl space-y-2">
                <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>// Academic Research &amp; Publications</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
                  Engineering Investigations
                </h2>
                <p className="text-sm text-muted font-sans">
                  Rigorous numerical research and technical monographs in fluid-structure mechanics and CAE optimization.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="font-mono text-xs gap-1 border-border">
                <Link href="/research">
                  <span>View All Research</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {researchList.slice(0, 2).map((paper) => (
                <div
                  key={paper.id}
                  className="rounded-xl border border-border bg-background p-6 transition-all hover:border-primary hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                      <span className="font-semibold text-primary">{paper.venue || "Working Paper"}</span>
                      <span>{paper.year}</span>
                    </div>
                    <h3 className="font-sans text-base font-bold text-foreground hover:text-primary transition-colors">
                      <Link href="/research">{paper.title}</Link>
                    </h3>
                    <p className="text-xs text-muted leading-relaxed font-sans line-clamp-3">
                      {paper.abstract}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
                    {paper.keywords.slice(0, 3).map((kw, i) => (
                      <span key={i} className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-muted">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 6. Credentials & Certifications Highlights */}
      {credentialsList.length > 0 && (
        <section className="py-16 border-b border-border bg-background">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="max-w-xl space-y-2">
                <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-cae">
                  <Award className="h-3.5 w-3.5" />
                  <span>// Professional Credentials &amp; Standards</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
                  Verified Qualifications
                </h2>
                <p className="text-sm text-muted font-sans">
                  Standardized CAD certifications, numerical simulation credentials, and GD&amp;T standards compliance.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="font-mono text-xs gap-1 border-border">
                <Link href="/credentials">
                  <span>View All Credentials</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {credentialsList.slice(0, 3).map((cred) => (
                <div
                  key={cred.id}
                  className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary hover:shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase text-cae border-cae/30">
                      {cred.badgeType}
                    </Badge>
                    <span className="font-mono text-xs text-muted">{cred.issueDate?.slice(0, 4)}</span>
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-bold text-foreground">{cred.title}</h3>
                    <p className="font-mono text-xs text-muted mt-0.5">{cred.issuer}</p>
                  </div>
                  {cred.credentialId && (
                    <div className="font-mono text-[10px] text-muted pt-2 border-t border-border">
                      ID: {cred.credentialId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 7. Contact / Engineering Collaboration Teaser */}
      <section className="py-20 bg-surface">
        <Container>
          <div className="rounded-2xl border border-border bg-gradient-to-r from-slate-900 to-slate-950 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,rgba(21,154,156,0.15),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-5">
              <Badge variant="outline" className="border-cyan-500/40 bg-cyan-950/60 font-mono text-xs text-cyan-400">
                // ENGINEERING COLLABORATION
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
                Ready to Discuss Engineering Systems, CAD, or Simulation?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                Whether you have a complex CAD assembly challenge, need high-fidelity CFD/FEA analysis, or want to explore collaborative research opportunities, feel free to reach out.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild size="lg" className="h-11 font-mono text-xs gap-2 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400">
                  <Link href="/contact">
                    <Mail className="h-4 w-4" />
                    Send Technical Inquiry
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 font-mono text-xs gap-2 border-slate-700 text-slate-200 hover:bg-slate-800">
                  <Link href="/cv">
                    <FileText className="h-4 w-4" />
                    Download Curriculum Vitae
                  </Link>
                </Button>
              </div>

              <div className="pt-4 flex items-center gap-6 font-mono text-xs text-slate-400">
                <span>Email: {ENGINEER.email}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
