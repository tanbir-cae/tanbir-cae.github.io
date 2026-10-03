import Link from "next/link";
import { ArrowUpRight, Calendar, Box, Wind, Cpu, Bot, Activity } from "lucide-react";
import type { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className = "" }: ProjectCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cad":
        return <Box className="h-3 w-3 mr-1" />;
      case "cfd":
        return <Wind className="h-3 w-3 mr-1" />;
      case "fea":
        return <Activity className="h-3 w-3 mr-1" />;
      case "robotics":
        return <Bot className="h-3 w-3 mr-1" />;
      default:
        return <Cpu className="h-3 w-3 mr-1" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "cad":
        return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "cfd":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400";
      case "fea":
        return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
      case "robotics":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
      default:
        return "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "simulation":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
      case "prototype":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-md ${className}`}
    >
      {/* Thumbnail */}
      <Link href={`/work/${project.slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 block">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900 font-mono text-xs text-muted">
            [ CAD / CAE MODEL PREVIEW ]
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 z-10">
          <Badge variant="outline" className={`font-mono text-[10px] uppercase font-semibold backdrop-blur-md ${getCategoryColor(project.category)}`}>
            {getCategoryIcon(project.category)}
            {CATEGORY_LABELS[project.category] || project.category}
          </Badge>
          {project.featured && (
            <Badge variant="outline" className="border-highlight/40 bg-highlight/15 font-mono text-[10px] text-highlight backdrop-blur-md">
              Featured
            </Badge>
          )}
        </div>

        {/* Status Badge right */}
        <div className="absolute right-3 top-3 z-10">
          <Badge variant="outline" className={`font-mono text-[10px] capitalize backdrop-blur-md ${getStatusColor(project.status)}`}>
            {STATUS_LABELS[project.status] || project.status}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Meta row: Year & Software */}
        <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-muted">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{project.year || "2024"}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.software.slice(0, 2).map((sw, i) => (
              <span key={i} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-foreground font-medium">
                {sw}
              </span>
            ))}
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 font-sans text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/work/${project.slug}`} className="hover:underline">
            {project.title}
          </Link>
        </h3>

        {/* Short Summary */}
        <p className="mb-4 flex-1 text-xs leading-relaxed text-muted line-clamp-3">
          {project.summary}
        </p>

        {/* Action Link Footer */}
        <div className="border-t border-border pt-3 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 flex-wrap">
            {project.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] font-mono text-muted">
                #{tag}
              </span>
            ))}
          </div>
          <Link
            href={`/work/${project.slug}`}
            className="flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:text-cae transition-colors"
          >
            Case Study
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
