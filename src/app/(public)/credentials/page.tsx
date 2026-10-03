import { Award, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { getPublishedCredentials } from "@/lib/data";
import { CredentialsClient } from "./credentials-client";

export const metadata = {
  title: "Credentials & Certifications | Md. Tanbir Hasan",
  description:
    "Professional engineering certifications, SolidWorks qualifications, ANSYS simulation credentials, and technical awards of Md. Tanbir Hasan.",
};

export const revalidate = 60;

export default async function CredentialsPage() {
  const credentials = await getPublishedCredentials();

  return (
    <div className="py-12 lg:py-16">
      <Container className="space-y-10">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-cae">
            <Award className="h-3.5 w-3.5" />
            <span>// Verified Qualifications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
            Credentials &amp; Certifications
          </h1>
          <p className="text-sm text-muted leading-relaxed font-sans">
            Formal engineering certifications, software proficiencies in SolidWorks and ANSYS, and technical standards compliance.
          </p>
        </div>

        {/* Credentials Interactive Grid & Modal */}
        <CredentialsClient credentials={credentials} />
      </Container>
    </div>
  );
}
