import { Film, Play, Box, Wind, Activity, Clock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { getPublishedMedia } from "@/lib/data";

export const metadata = {
  title: "Engineering Animations & Media | Md. Tanbir Hasan",
  description:
    "Engineering motion studies, SolidWorks exploded kinematic animations, transient CFD flow simulations, and FEA deformation loops by Md. Tanbir Hasan.",
};

export const revalidate = 60;

export default async function MediaPage() {
  const mediaItems = await getPublishedMedia();

  return (
    <div className="py-12 lg:py-16">
      <Container className="space-y-12">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary">
            <Film className="h-3.5 w-3.5" />
            <span>// Dynamic Engineering Media</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
            Engineering Animations &amp; Motion Studies
          </h1>
          <p className="text-sm text-muted leading-relaxed font-sans">
            Visual recordings of transient numerical solutions, kinematic gear mechanisms, and structural deformation cycling. All videos are muted by default.
          </p>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              {/* Media Player / Preview */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden group">
                {item.videoUrl && item.videoUrl.endsWith(".mp4") ? (
                  <video
                    src={item.videoUrl}
                    poster={item.thumbnailUrl || undefined}
                    controls
                    muted
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : item.thumbnailUrl ? (
                  <div className="relative h-full w-full">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white shadow-xl">
                        <Play className="h-5 w-5 ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted">
                    [ MOTION STUDY VIDEO ]
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="flex flex-1 flex-col p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase text-primary border-primary/30">
                    {item.mediaType.replace(/_/g, " ")}
                  </Badge>
                  {item.softwareUsed && (
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-muted font-medium">
                      {item.softwareUsed}
                    </span>
                  )}
                </div>

                <h3 className="font-sans text-base font-bold text-foreground">
                  {item.title}
                </h3>

                <p className="text-xs text-muted leading-relaxed font-sans line-clamp-3">
                  {item.description}
                </p>

                {item.caption && (
                  <div className="mt-auto pt-3 border-t border-border font-mono text-[11px] text-muted italic">
                    {item.caption}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
