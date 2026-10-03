"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, Globe, EyeOff, ArrowUpRight, X, Save, Sliders, Box, Wind, Activity, Bot } from "lucide-react";
import type { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProjectAction, toggleProjectPublishAction, deleteProjectAction } from "@/lib/cms/actions";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/types/enums";

interface ProjectManagerProps {
  initialProjects: Project[];
}

export function ProjectManager({ initialProjects }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = projects.filter(
    (p) => filterCategory === "all" || p.category === filterCategory
  );

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, published: !currentPublished } : p))
    );
    await toggleProjectPublishAction(id, currentPublished);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this engineering project?")) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await deleteProjectAction(id);
  };

  const handleOpenNew = () => {
    setEditingProject(null);
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setEditingProject(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", ...PROJECT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-lg px-3 py-1 font-mono text-xs capitalize transition-colors ${
                filterCategory === cat
                  ? "bg-primary text-white font-semibold"
                  : "bg-surface border border-border text-muted hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Projects" : cat}
            </button>
          ))}
        </div>

        <Button onClick={handleOpenNew} size="sm" className="font-mono text-xs gap-1.5 bg-primary text-white">
          <Plus className="h-3.5 w-3.5" />
          Add Case Study
        </Button>
      </div>

      {/* Projects List Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="divide-y divide-border">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
            >
              {/* Info Column */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-sans text-sm font-bold text-foreground truncate">
                    {project.title}
                  </span>
                  <Badge variant="outline" className="font-mono text-[9px] uppercase">
                    {project.category}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted">{project.year || "2024"}</span>
                  {project.featured && (
                    <Badge variant="highlight" className="text-[9px]">
                      Featured
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted font-sans line-clamp-1">
                  {project.summary}
                </p>

                <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
                  <span>Software: {project.software.join(", ")}</span>
                  <span>·</span>
                  <span>Slug: /{project.slug}</span>
                </div>
              </div>

              {/* Action Column */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Publish Toggle Button */}
                <button
                  onClick={() => handleTogglePublish(project.id, project.published)}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                    project.published
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                  }`}
                  title={project.published ? "Click to set as Draft" : "Click to Publish"}
                >
                  {project.published ? (
                    <>
                      <Globe className="h-3 w-3" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3" />
                      <span>Draft</span>
                    </>
                  )}
                </button>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProject(project)}
                  className="h-8 px-2.5 font-mono text-xs border-border"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>

                {/* Preview Link */}
                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted hover:text-foreground">
                  <Link href={`/work/${project.slug}`} target="_blank">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-1.5 text-muted hover:text-rose-500 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Editor Modal Drawer */}
      {(isCreating || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-3xl rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 p-1.5 text-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
                {editingProject ? "Edit Engineering Case Study" : "Create New Engineering Project"}
              </h2>
              <p className="font-mono text-xs text-muted mt-1">
                Configure CAD specifications, numerical physics parameters, and publication visibility.
              </p>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                await saveProjectAction(formData);
                setIsSubmitting(false);
                handleCloseModal();
              }}
              className="space-y-6"
            >
              {editingProject && <input type="hidden" name="id" value={editingProject.id} />}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="title" className="font-mono text-xs">Project Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={editingProject?.title}
                    placeholder="e.g. Wave Impact on a Vertical Wall — Multiphase CFD"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slug" className="font-mono text-xs">URL Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={editingProject?.slug}
                    placeholder="wave-impact-vertical-wall"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="font-mono text-xs">Discipline Category</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={editingProject?.category || "cad"}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono"
                  >
                    {PROJECT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="font-mono text-xs">Project Status</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={editingProject?.status || "completed"}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono"
                  >
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="year" className="font-mono text-xs">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    defaultValue={editingProject?.year || "2024"}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Software & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="software" className="font-mono text-xs">Software Tools (comma-separated)</Label>
                  <Input
                    id="software"
                    name="software"
                    defaultValue={editingProject?.software.join(", ")}
                    placeholder="SolidWorks, ANSYS Fluent, Python"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tags" className="font-mono text-xs">Technical Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    defaultValue={editingProject?.tags.join(", ")}
                    placeholder="CFD, Multiphase, VOF, Transient"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Summaries */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="summary" className="font-mono text-xs">Executive Summary</Label>
                  <textarea
                    id="summary"
                    name="summary"
                    rows={2}
                    defaultValue={editingProject?.summary || ""}
                    placeholder="Concise overview of engineering objectives and conclusions..."
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="problemStatement" className="font-mono text-xs">Problem Statement & Objective</Label>
                  <textarea
                    id="problemStatement"
                    name="problemStatement"
                    rows={3}
                    defaultValue={editingProject?.problemStatement || ""}
                    placeholder="The physical engineering challenge and constraints addressed..."
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-sans"
                  />
                </div>
              </div>

              {/* Design Specifications Sub-section */}
              <div className="rounded-xl border border-border p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-mono text-xs font-bold uppercase text-foreground">
                  Design Specifications &amp; Operational Constraints
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <Input name="spec_dimensions" defaultValue={editingProject?.designSpecs?.dimensions} placeholder="Envelope / Dimensions" className="text-xs" />
                  <Input name="spec_materials" defaultValue={editingProject?.designSpecs?.materials} placeholder="Materials (e.g. AISI 4340, Al 7075-T6)" className="text-xs" />
                  <Input name="spec_operatingConditions" defaultValue={editingProject?.designSpecs?.operatingConditions} placeholder="Operating Conditions (e.g. 350 bar, 1800 RPM)" className="text-xs" />
                  <Input name="spec_loads" defaultValue={editingProject?.designSpecs?.loads} placeholder="Loads (e.g. 48.6 kPa dynamic pressure)" className="text-xs" />
                  <Input name="spec_constraints" defaultValue={editingProject?.designSpecs?.constraints} placeholder="Constraints (e.g. FOS > 2.0, Backlash < 0.08mm)" className="text-xs" />
                  <Input name="spec_manufacturing" defaultValue={editingProject?.designSpecs?.manufacturingConsiderations} placeholder="Manufacturing (e.g. 5-axis CNC, ASME Y14.5)" className="text-xs" />
                </div>
              </div>

              {/* Simulation Physics Sub-section */}
              <div className="rounded-xl border border-border p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-mono text-xs font-bold uppercase text-foreground">
                  Numerical Simulation Physics &amp; Solver Setup
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <Input name="sim_solver" defaultValue={editingProject?.simulationDetails?.solver} placeholder="Solver (e.g. Pressure-based transient PISO)" className="text-xs" />
                  <Input name="sim_physics" defaultValue={editingProject?.simulationDetails?.physics} placeholder="Physics (e.g. Multiphase VOF Geo-Reconstruct)" className="text-xs" />
                  <Input name="sim_turbulenceModel" defaultValue={editingProject?.simulationDetails?.turbulenceModel} placeholder="Turbulence Model (e.g. k-ω SST)" className="text-xs" />
                  <Input name="sim_mesh" defaultValue={editingProject?.simulationDetails?.mesh} placeholder="Mesh (e.g. Poly-hexcore 840,000 cells)" className="text-xs" />
                  <Input name="sim_boundaryConditions" defaultValue={editingProject?.simulationDetails?.boundaryConditions} placeholder="Boundary Conditions" className="text-xs" />
                  <Input name="sim_loadCases" defaultValue={editingProject?.simulationDetails?.loadCases} placeholder="Load Cases" className="text-xs" />
                </div>
              </div>

              {/* Visibility checkboxes */}
              <div className="flex items-center gap-6 pt-2 font-mono text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={editingProject ? editingProject.published : true}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span>Publish to Public Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingProject?.featured}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" type="button" onClick={handleCloseModal} className="font-mono text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-mono text-xs gap-1.5 bg-primary text-white">
                  <Save className="h-3.5 w-3.5" />
                  {isSubmitting ? "Saving..." : "Save Case Study"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
