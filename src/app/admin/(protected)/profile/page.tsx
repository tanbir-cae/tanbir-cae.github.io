import { getAdminProfile } from "@/lib/data";
import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProfileAction } from "@/lib/cms/actions";

export const revalidate = 0;

export default async function AdminProfilePage() {
  const profile = await getAdminProfile();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-primary uppercase">
          <User className="h-3.5 w-3.5" />
          <span>// Profile Management</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground font-sans">
          Engineer Profile &amp; Contact Details
        </h1>
        <p className="mt-1 text-xs text-muted font-sans">
          Update your public professional title, biography, academic focus, and curriculum vitae download link.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
        <form action={saveProfileAction} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="font-mono text-xs">Full Name</Label>
            <Input id="fullName" name="fullName" defaultValue={profile?.fullName || "Md. Tanbir Hasan"} className="text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="professionalTitle" className="font-mono text-xs">Professional Title</Label>
            <Input id="professionalTitle" name="professionalTitle" defaultValue={profile?.professionalTitle || "Mechanical Design & CAE Engineer"} className="text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-mono text-xs">Email Address</Label>
            <Input id="email" name="email" type="email" defaultValue={profile?.email || "tanbirhasan.mail@gmail.com"} className="text-xs font-mono" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl" className="font-mono text-xs">LinkedIn Profile URL</Label>
              <Input id="linkedinUrl" name="linkedinUrl" defaultValue={profile?.linkedinUrl || "https://www.linkedin.com/in/tanbir-hasan"} className="text-xs font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="githubUrl" className="font-mono text-xs">GitHub Profile URL</Label>
              <Input id="githubUrl" name="githubUrl" defaultValue={profile?.githubUrl || "https://github.com"} className="text-xs font-mono" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cvUrl" className="font-mono text-xs">CV Download URL (PDF)</Label>
            <Input id="cvUrl" name="cvUrl" defaultValue={profile?.cvUrl || ""} placeholder="https://.../tanbir_hasan_cv.pdf" className="text-xs font-mono" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="biography" className="font-mono text-xs">Engineering Biography</Label>
            <textarea
              id="biography"
              name="biography"
              rows={5}
              defaultValue={profile?.biography || ""}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-sans leading-relaxed text-foreground"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="font-mono text-xs gap-1.5 bg-primary text-white">
              <Save className="h-3.5 w-3.5" />
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
