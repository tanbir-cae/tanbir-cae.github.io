"use client";

import { useState } from "react";
import { Upload, Copy, Check, FileText, Box, Film, Award, Image, ExternalLink, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STORAGE_BUCKETS, type StorageBucket } from "@/types/enums";

export function FileManagerClient() {
  const [activeBucket, setActiveBucket] = useState<StorageBucket>("3d-models");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const mockFilesByBucket: Record<StorageBucket, Array<{ name: string; size: string; date: string; url: string }>> = {
    "3d-models": [
      { name: "planetary_gearbox_assembly.sldasm", size: "4.8 MB", date: "2024-02-10", url: "/models/planetary_gearbox_assembly.sldasm" },
      { name: "hydraulic_manifold_body.sldprt", size: "2.1 MB", date: "2024-01-20", url: "/models/hydraulic_manifold_body.sldprt" },
      { name: "robotic_differential_chassis.step", size: "3.4 MB", date: "2023-11-12", url: "/models/robotic_differential_chassis.step" },
    ],
    "project-images": [
      { name: "cfd-wave-thumb.svg", size: "12 KB", date: "2024-03-15", url: "/images/cfd-wave-thumb.svg" },
      { name: "cfd-pressure-contour.svg", size: "8 KB", date: "2024-03-15", url: "/images/cfd-pressure-contour.svg" },
      { name: "cad-gearbox-exploded.svg", size: "15 KB", date: "2024-02-10", url: "/images/cad-gearbox-exploded.svg" },
      { name: "fea-stress-contour.svg", size: "9 KB", date: "2024-01-20", url: "/images/fea-stress-contour.svg" },
    ],
    "engineering-media": [
      { name: "wave-impact-sim.mp4", size: "18.2 MB", date: "2024-03-20", url: "/media/wave-impact-sim.mp4" },
      { name: "gearbox-motion.mp4", size: "12.4 MB", date: "2024-02-18", url: "/media/gearbox-motion.mp4" },
    ],
    "documents": [
      { name: "wave_impact_technical_report.pdf", size: "3.2 MB", date: "2024-04-01", url: "/documents/wave_impact_technical_report.pdf" },
      { name: "tanbir_hasan_cv.pdf", size: "240 KB", date: "2024-01-01", url: "/cv" },
    ],
    "certificates": [
      { name: "cswp_certificate_tanbir_hasan.pdf", size: "480 KB", date: "2023-08-15", url: "/certificates/cswp_certificate.pdf" },
      { name: "ansys_fluent_credential.pdf", size: "310 KB", date: "2023-11-20", url: "/certificates/ansys_fluent.pdf" },
    ],
  };

  const currentFiles = mockFilesByBucket[activeBucket] || [];

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getBucketIcon = (bucket: StorageBucket) => {
    switch (bucket) {
      case "3d-models":
        return <Box className="h-3.5 w-3.5" />;
      case "project-images":
        return <Image className="h-3.5 w-3.5" />;
      case "engineering-media":
        return <Film className="h-3.5 w-3.5" />;
      case "certificates":
        return <Award className="h-3.5 w-3.5" />;
      default:
        return <FileText className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Bucket Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-3">
        {STORAGE_BUCKETS.map((b) => (
          <button
            key={b}
            onClick={() => setActiveBucket(b)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs transition-colors flex-shrink-0 ${
              activeBucket === b
                ? "bg-primary text-white font-semibold shadow-sm"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            {getBucketIcon(b)}
            <span>{b}</span>
          </button>
        ))}
      </div>

      {/* Upload Dropzone Box */}
      <div className="rounded-2xl border-2 border-dashed border-border bg-slate-50/50 dark:bg-slate-900/30 p-8 text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
          <Upload className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-sans text-sm font-bold text-foreground">
            Upload files to bucket &apos;{activeBucket}&apos;
          </h3>
          <p className="mt-1 font-mono text-xs text-muted">
            Supports SolidWorks (.SLDPRT, .SLDASM), STEP, STL, GLB, MP4, PDF, and high-res SVG/PNG
          </p>
        </div>
        <div className="pt-2">
          <label className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-primary/90 cursor-pointer shadow-sm">
            <Upload className="h-3.5 w-3.5" />
            <span>Select Local Asset</span>
            <input type="file" className="hidden" />
          </label>
        </div>
      </div>

      {/* File List Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 flex items-center justify-between font-mono text-xs text-muted">
          <span>File Asset Name</span>
          <div className="flex items-center gap-8">
            <span className="hidden sm:inline">File Size</span>
            <span className="hidden sm:inline">Date Added</span>
            <span>Action</span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {currentFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 text-xs font-mono">
              <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-4">
                {getBucketIcon(activeBucket)}
                <span className="truncate font-medium text-foreground">{file.name}</span>
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                <span className="hidden sm:inline text-muted">{file.size}</span>
                <span className="hidden sm:inline text-muted">{file.date}</span>
                <button
                  onClick={() => handleCopy(file.url)}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-muted hover:text-foreground transition-colors"
                  title="Copy File URL"
                >
                  {copiedUrl === file.url ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500 text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="text-[10px]">Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
