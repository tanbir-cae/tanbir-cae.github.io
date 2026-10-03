import Link from "next/link";
import {
  FolderGit2,
  Box,
  Wind,
  Activity,
  Bot,
  BookOpen,
  Award,
  Film,
  Plus,
  ArrowUpRight,
  Mail,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardCounts, getAllProjects, getContactMessages } from "@/lib/data";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [counts, projects, messages] = await Promise.all([
    getDashboardCounts(),
    getAllProjects(),
    getContactMessages(),
  ]);

  const statCards = [
    { label: "Total Projects", value: counts.totalProjects, sub: `${counts.publishedProjects} Published · ${counts.draftProjects} Draft`, icon: FolderGit2, color: "text-primary bg-primary/10" },
    { label: "CAD Assemblies", value: counts.cadProjects, sub: "SolidWorks & GD&T", icon: Box, color: "text-blue-600 bg-blue-500/10" },
    { label: "CFD Simulations", value: counts.cfdProjects, sub: "ANSYS Fluent & VOF", icon: Wind, color: "text-cae bg-cae/10" },
    { label: "FEA Structural", value: counts.feaProjects, sub: "ANSYS Mechanical", icon: Activity, color: "text-amber-600 bg-amber-500/10" },
    { label: "Robotics & Hardware", value: counts.roboticsProjects, sub: "PID & Microcontrollers", icon: Bot, color: "text-emerald-600 bg-emerald-500/10" },
    { label: "Research Papers", value: counts.researchPapers, sub: "Monographs & Studies", icon: BookOpen, color: "text-purple-600 bg-purple-500/10" },
    { label: "Credentials", value: counts.credentials, sub: "Certifications on File", icon: Award, color: "text-orange-600 bg-orange-500/10" },
    { label: "Media & Motion", value: counts.mediaItems, sub: "Transient Animations", icon: Film, color: "text-rose-600 bg-rose-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Engineering CMS Control Center
          </h1>
          <p className="mt-1 font-mono text-xs text-muted">
            Manage CAD case studies, numerical simulation parameters, credentials, and cloud files.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild size="sm" className="font-mono text-xs gap-1.5 bg-primary text-white">
            <Link href="/admin/projects">
              <Plus className="h-3.5 w-3.5" />
              New Case Study
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="font-mono text-xs gap-1.5 border-border">
            <Link href="/admin/files">
              <Layers className="h-3.5 w-3.5" />
              File Manager
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="font-mono text-xs gap-1 text-muted hover:text-foreground">
            <Link href="/" target="_blank">
              <span>View Live Site</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="rounded-xl border border-border bg-surface p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">{card.label}</span>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="font-sans text-2xl font-bold text-foreground">
                {card.value}
              </div>
              <div className="font-mono text-[10px] text-muted truncate">
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Projects Table & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Projects Summary (Left 2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-sans text-base font-bold text-foreground">
              Recent Engineering Projects
            </h2>
            <Link href="/admin/projects" className="font-mono text-xs text-primary hover:underline">
              View All Projects ({projects.length})
            </Link>
          </div>

          <div className="divide-y divide-border">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-bold text-foreground truncate">
                      {p.title}
                    </span>
                    <Badge variant="outline" className="font-mono text-[9px] uppercase">
                      {p.category}
                    </Badge>
                  </div>
                  <div className="font-mono text-[11px] text-muted">
                    {p.year || "2024"} · {p.software.slice(0, 2).join(", ")}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${
                      p.published ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                  <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted hover:text-foreground">
                    <Link href={`/work/${p.slug}`} target="_blank">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries (Right col) */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-1.5 font-sans text-base font-bold text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>Inquiries</span>
            </div>
            <span className="font-mono text-xs text-muted">{messages.length} messages</span>
          </div>

          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.slice(0, 4).map((msg) => (
                <div key={msg.id} className="rounded-xl border border-border/80 p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                    <span className="font-bold text-foreground">{msg.name}</span>
                    <span>{msg.createdAt.slice(0, 10)}</span>
                  </div>
                  <div className="font-mono text-[11px] text-primary truncate">{msg.email}</div>
                  {msg.subject && (
                    <div className="font-semibold text-foreground text-[11px]">{msg.subject}</div>
                  )}
                  <p className="text-[11px] text-muted line-clamp-2">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center font-mono text-xs text-muted">
              No new contact inquiries received yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
