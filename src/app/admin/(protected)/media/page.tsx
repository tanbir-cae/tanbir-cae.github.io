import { getAllMedia } from "@/lib/data";
import { MediaManager } from "./media-manager";
import { Film } from "lucide-react";

export const revalidate = 0;

export default async function AdminMediaPage() {
  const mediaList = await getAllMedia();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-primary uppercase">
          <Film className="h-3.5 w-3.5" />
          <span>// Engineering Media CMS</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground font-sans">
          Engineering Animations &amp; Media
        </h1>
        <p className="mt-1 text-xs text-muted font-sans">
          Manage kinematic motion studies, transient CFD captures, and FEA deformation loops.
        </p>
      </div>

      <MediaManager initialMedia={mediaList} />
    </div>
  );
}
