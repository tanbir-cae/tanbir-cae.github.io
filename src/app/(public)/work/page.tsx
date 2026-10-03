import { Container } from "@/components/layout/container";
import { getPublishedProjects } from "@/lib/data";
import { WorkArchiveClient } from "./work-archive-client";
import { FolderGit2 } from "lucide-react";

export const metadata = {
  title: "Engineering Work & Case Studies | Md. Tanbir Hasan",
  description:
    "Comprehensive archive of mechanical design, SolidWorks CAD assemblies, ANSYS Fluent CFD, ANSYS Mechanical FEA, and robotics projects by Md. Tanbir Hasan.",
};

export const revalidate = 60;

interface WorkPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const { category } = await searchParams;
  const projects = await getPublishedProjects();

  return (
    <div className="py-12 lg:py-16">
      <Container>
        {/* Page Title & Intro */}
        <div className="max-w-2xl mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>// Project Archive</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
            Engineering Work &amp; Case Studies
          </h1>
          <p className="text-sm text-muted leading-relaxed font-sans">
            Detailed engineering projects spanning 3D CAD modeling, multi-physics CFD simulations, structural FEA stress evaluations, and physical mechatronics prototypes.
          </p>
        </div>

        {/* Dynamic Filtered Archive Client */}
        <WorkArchiveClient
          initialProjects={projects}
          defaultCategory={category || "all"}
        />
      </Container>
    </div>
  );
}
