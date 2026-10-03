"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContourSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeSubtitle?: string;
  afterSubtitle?: string;
  className?: string;
}

export function ContourSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Pressure Field (kPa)",
  afterLabel = "Velocity Magnitude (m/s)",
  beforeSubtitle = "Stagnation impact peak: 48.6 kPa",
  afterSubtitle = "Jet run-up velocity: 4.82 m/s",
  className = "",
}: ContourSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-xl border border-border bg-slate-950 shadow-xl ${className}`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan-500/40 bg-cyan-950/40 font-mono text-[11px] text-cyan-400">
            <SlidersHorizontal className="mr-1 h-3 w-3" />
            CONTOUR COMPARISON
          </Badge>
          <span className="text-xs text-slate-300 font-medium">Interactive Split-Field Inspection</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Drag central divider to inspect cross-correlation
        </div>
      </div>

      {/* Main Interactive Comparison Viewport */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className="relative h-[380px] sm:h-[460px] w-full cursor-ew-resize select-none overflow-hidden bg-slate-950"
      >
        {/* Background / After Layer (Full Width) */}
        <div className="absolute inset-0 h-full w-full">
          <img
            src={afterImage}
            alt={afterLabel}
            className="h-full w-full object-cover object-center pointer-events-none"
          />
          {/* Label Badge (Right) */}
          <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-1">
            <span className="rounded bg-slate-950/85 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              {afterLabel}
            </span>
            {afterSubtitle && (
              <span className="rounded bg-slate-950/70 px-2 py-0.5 font-mono text-[10px] text-slate-300 backdrop-blur-sm">
                {afterSubtitle}
              </span>
            )}
          </div>
        </div>

        {/* Foreground / Before Layer (Clipped by slider position) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="absolute inset-0 w-screen">
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="h-full w-full object-cover object-center pointer-events-none"
            />
          </div>
          {/* Label Badge (Left) */}
          <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-1">
            <span className="rounded bg-slate-950/85 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
              {beforeLabel}
            </span>
            {beforeSubtitle && (
              <span className="rounded bg-slate-950/70 px-2 py-0.5 font-mono text-[10px] text-slate-300 backdrop-blur-sm">
                {beforeSubtitle}
              </span>
            )}
          </div>
        </div>

        {/* Central Split Divider Handle */}
        <div
          className="absolute inset-y-0 z-20 flex w-1 -translate-x-1/2 items-center justify-center bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cyan-300 bg-slate-950 text-cyan-400 shadow-xl transition-transform hover:scale-110 active:scale-95">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Footer Meta bar */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-4 py-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <span>{beforeLabel}</span>
        </div>
        <div className="text-slate-500">Split: {Math.round(sliderPosition)}% / {100 - Math.round(sliderPosition)}%</div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{afterLabel}</span>
        </div>
      </div>
    </div>
  );
}
