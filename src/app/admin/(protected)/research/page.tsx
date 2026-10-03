import { getAllResearch } from "@/lib/data";
import { ResearchManager } from "./research-manager";
import { BookOpen } from "lucide-react";

export const revalidate = 0;

export default async function AdminResearchPage() {
  const papers = await getAllResearch();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-primary uppercase">
          <BookOpen className="h-3.5 w-3.5" />
          <span>// Research CMS</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground font-sans">
          Research Publications &amp; Working Papers
        </h1>
        <p className="mt-1 text-xs text-muted font-sans">
          Manage technical investigations, conference papers, and academic monographs.
        </p>
      </div>

      <ResearchManager initialPapers={papers} />
    </div>
  );
}
