"use client";

import { useState, useMemo } from "react";
import type { Project } from "@/types/project";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectFilter } from "@/components/project/project-filter";
import { FolderGit2 } from "lucide-react";

interface WorkArchiveClientProps {
  initialProjects: Project[];
  defaultCategory?: string;
}

export function WorkArchiveClient({
  initialProjects,
  defaultCategory = "all",
}: WorkArchiveClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [selectedSoftware, setSelectedSoftware] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      // Category filter
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      // Software filter
      if (selectedSoftware && !p.software.includes(selectedSoftware)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchSummary = p.summary?.toLowerCase().includes(query) ?? false;
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(query));
        const matchSoftware = p.software.some((s) => s.toLowerCase().includes(query));
        if (!matchTitle && !matchSummary && !matchTags && !matchSoftware) {
          return false;
        }
      }
      return true;
    });
  }, [initialProjects, selectedCategory, selectedSoftware, searchQuery]);

  return (
    <div>
      {/* Dynamic Filter Header */}
      <ProjectFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedSoftware={selectedSoftware}
        onSelectSoftware={setSelectedSoftware}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={initialProjects.length}
        filteredCount={filteredProjects.length}
      />

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <FolderGit2 className="h-10 w-10 text-muted mb-3" />
          <h3 className="font-mono text-sm font-semibold text-foreground">
            No projects found matching criteria
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm">
            Try adjusting your search terms, clearing the software filter, or switching categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSoftware(null);
              setSearchQuery("");
            }}
            className="mt-4 rounded-lg bg-primary px-3.5 py-1.5 font-mono text-xs text-white hover:bg-primary/90 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
