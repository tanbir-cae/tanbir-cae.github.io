import { getAllProjects } from "@/lib/data";
import { ProjectManager } from "./project-manager";
import { FolderGit2 } from "lucide-react";

export const revalidate = 0;

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-primary uppercase">
          <FolderGit2 className="h-3.5 w-3.5" />
          <span>// Case Study CMS</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground font-sans">
          Project Case Studies
        </h1>
        <p className="mt-1 text-xs text-muted font-sans">
          Create, edit, and organize SolidWorks CAD, ANSYS CFD/FEA, and robotics projects.
        </p>
      </div>

      <ProjectManager initialProjects={projects} />
    </div>
  );
}
