import { FileManagerClient } from "./file-manager-client";
import { HardDrive } from "lucide-react";

export const revalidate = 0;

export default function AdminFilesPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-primary uppercase">
          <HardDrive className="h-3.5 w-3.5" />
          <span>// Storage Buckets &amp; Files</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground font-sans">
          Cloud Engineering Assets &amp; File Manager
        </h1>
        <p className="mt-1 text-xs text-muted font-sans">
          Upload and manage SolidWorks assemblies, STEP/STL models, simulation videos, and drawing sheets.
        </p>
      </div>

      <FileManagerClient />
    </div>
  );
}
