"use client";

import { useState } from "react";
import { Plus, Edit3, Trash2, X, Save, BookOpen } from "lucide-react";
import type { ResearchPaper } from "@/types/research";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { saveResearchAction, deleteResearchAction } from "@/lib/cms/actions";
import { RESEARCH_KINDS } from "@/types/enums";

export function ResearchManager({ initialPapers }: { initialPapers: ResearchPaper[] }) {
  const [papers, setPapers] = useState(initialPapers);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research paper?")) return;
    setPapers((prev) => prev.filter((p) => p.id !== id));
    await deleteResearchAction(id);
  };

  const handleClose = () => {
    setEditingPaper(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <span className="font-mono text-xs text-muted">
          Showing {papers.length} publications &amp; working papers
        </span>
        <Button onClick={() => setIsCreating(true)} size="sm" className="font-mono text-xs gap-1.5 bg-primary text-white">
          <Plus className="h-3.5 w-3.5" />
          Add Research Entry
        </Button>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {papers.map((paper) => (
          <div key={paper.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-sm font-bold text-foreground truncate">{paper.title}</span>
                <Badge variant="outline" className="font-mono text-[9px] uppercase">
                  {paper.kind.replace(/_/g, " ")}
                </Badge>
                <span className="font-mono text-[10px] text-muted">{paper.year}</span>
              </div>
              <p className="text-xs text-muted line-clamp-1 font-sans">{paper.abstract}</p>
              <div className="font-mono text-[10px] text-muted">
                Venue: {paper.venue || "Unassigned"} · Authors: {paper.authors.join(", ")}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => setEditingPaper(paper)} className="h-8 font-mono text-xs border-border">
                <Edit3 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <button onClick={() => handleDelete(paper.id)} className="p-1.5 text-muted hover:text-rose-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isCreating || editingPaper) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6">
            <button onClick={handleClose} className="absolute right-4 top-4 p-1.5 text-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold font-sans">
                {editingPaper ? "Edit Publication Details" : "Add Research Publication"}
              </h2>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                await saveResearchAction(formData);
                setIsSubmitting(false);
                handleClose();
              }}
              className="space-y-4"
            >
              {editingPaper && <input type="hidden" name="id" value={editingPaper.id} />}

              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-mono text-xs">Paper Title *</Label>
                <Input id="title" name="title" required defaultValue={editingPaper?.title} className="text-xs" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="kind" className="font-mono text-xs">Kind</Label>
                  <select id="kind" name="kind" defaultValue={editingPaper?.kind || "journal_paper"} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono">
                    {RESEARCH_KINDS.map((k) => (
                      <option key={k} value={k}>{k.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="year" className="font-mono text-xs">Year</Label>
                  <Input id="year" name="year" defaultValue={editingPaper?.year || "2024"} className="text-xs font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue" className="font-mono text-xs">Journal / Conference / Monograph Venue</Label>
                <Input id="venue" name="venue" defaultValue={editingPaper?.venue || ""} placeholder="e.g. Journal of Fluids and Structures" className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="authors" className="font-mono text-xs">Authors (comma-separated)</Label>
                <Input id="authors" name="authors" defaultValue={editingPaper?.authors.join(", ") || "Md. Tanbir Hasan"} className="text-xs font-mono" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="abstract" className="font-mono text-xs">Abstract</Label>
                <textarea id="abstract" name="abstract" rows={4} defaultValue={editingPaper?.abstract || ""} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-sans" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="keywords" className="font-mono text-xs">Keywords (comma-separated)</Label>
                <Input id="keywords" name="keywords" defaultValue={editingPaper?.keywords.join(", ")} placeholder="CFD, Multiphase, VOF" className="text-xs font-mono" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pdfUrl" className="font-mono text-xs">PDF Document URL</Label>
                  <Input id="pdfUrl" name="pdfUrl" defaultValue={editingPaper?.pdfUrl || ""} className="text-xs font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="externalUrl" className="font-mono text-xs">External Link / DOI</Label>
                  <Input id="externalUrl" name="externalUrl" defaultValue={editingPaper?.externalUrl || ""} className="text-xs font-mono" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 font-mono text-xs">
                <input type="checkbox" id="published" name="published" defaultChecked={editingPaper ? editingPaper.published : true} className="h-4 w-4 rounded accent-primary" />
                <Label htmlFor="published">Published to public website</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" type="button" onClick={handleClose} className="font-mono text-xs">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="font-mono text-xs gap-1.5 bg-primary text-white">
                  <Save className="h-3.5 w-3.5" />
                  {isSubmitting ? "Saving..." : "Save Paper"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
