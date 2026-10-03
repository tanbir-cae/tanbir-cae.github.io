"use client";

import { Search, X, Filter } from "lucide-react";
import { WORK_FILTERS, SOFTWARE_FILTERS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProjectFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSoftware: string | null;
  onSelectSoftware: (software: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function ProjectFilter({
  selectedCategory,
  onSelectCategory,
  selectedSoftware,
  onSelectSoftware,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
}: ProjectFilterProps) {
  const hasActiveFilters = selectedCategory !== "all" || selectedSoftware !== null || searchQuery.trim().length > 0;

  const handleClear = () => {
    onSelectCategory("all");
    onSelectSoftware(null);
    onSearchChange("");
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Category Pills & Search Bar Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {WORK_FILTERS.map((cat) => {
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`flex-shrink-0 rounded-lg px-3.5 py-1.5 font-mono text-xs font-medium transition-all ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface border border-border text-muted hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
          <Input
            type="text"
            placeholder="Search projects, methods, CAD..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs bg-surface"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Software Chips & Filter Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted">
            <Filter className="h-3 w-3" />
            Tool:
          </span>
          {SOFTWARE_FILTERS.map((sw) => {
            const active = selectedSoftware === sw;
            return (
              <button
                key={sw}
                onClick={() => onSelectSoftware(active ? null : sw)}
                className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-colors ${
                  active
                    ? "bg-cae text-white font-medium shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-muted hover:text-foreground"
                }`}
              >
                {sw}
              </button>
            );
          })}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 text-[11px] font-mono text-rose-500 hover:text-rose-600 px-2"
            >
              Reset Filters
            </Button>
          )}
        </div>

        <div className="font-mono text-[11px] text-muted">
          Showing <span className="font-semibold text-foreground">{filteredCount}</span> of {totalCount} engineering case studies
        </div>
      </div>
    </div>
  );
}
