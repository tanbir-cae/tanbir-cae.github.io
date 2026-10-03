import { getAllCredentials } from "@/lib/data";
import { CredentialsManager } from "./credentials-manager";
import { Award } from "lucide-react";

export const revalidate = 0;

export default async function AdminCredentialsPage() {
  const credentials = await getAllCredentials();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-primary uppercase">
          <Award className="h-3.5 w-3.5" />
          <span>// Credentials CMS</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground font-sans">
          Engineering Certifications &amp; Credentials
        </h1>
        <p className="mt-1 text-xs text-muted font-sans">
          Manage SolidWorks CSWP qualifications, ANSYS simulation training, and standards compliance.
        </p>
      </div>

      <CredentialsManager initialCredentials={credentials} />
    </div>
  );
}
