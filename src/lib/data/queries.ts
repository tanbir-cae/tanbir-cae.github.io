/**
 * Server-side query functions for public portfolio data.
 * All functions use the authenticated server Supabase client and rely on RLS
 * to filter published/unpublished content appropriately.
 *
 * When Supabase environment variables are unconfigured or when a table is empty,
 * safe fallback functions provide verified initial portfolio data without crashing.
 */
import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  mapProject,
  mapProjectAsset,
  mapResearchPaper,
  mapCredential,
  mapEngineeringMedia,
  mapProfile,
  mapSkill,
  mapSiteSettings,
  mapManagedFile,
  mapContactMessage,
} from "./mappers";
import {
  FALLBACK_PROFILE,
  FALLBACK_SKILLS,
  FALLBACK_PROJECTS,
  FALLBACK_RESEARCH,
  FALLBACK_CREDENTIALS,
  FALLBACK_MEDIA,
} from "./fallback-data";
import type { Project, ProjectWithAssets } from "@/types/project";
import type { ResearchPaper } from "@/types/research";
import type { Credential } from "@/types/credentials";
import type { EngineeringMedia } from "@/types/media";
import type { Profile, Skill } from "@/types/profile";
import type { SiteSettings, ContactMessage } from "@/types/site";
import type { ManagedFile } from "@/types/storage";
import type { ProjectCategory } from "@/types/enums";

// ── Site Settings ──────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: "settings-default",
      siteTitle: "Md. Tanbir Hasan — Mechanical Design & CAE Engineer",
      siteDescription: "Professional portfolio of Md. Tanbir Hasan. Specializing in Mechanical Design, SolidWorks 3D CAD, FEA, CFD simulations, and engineering robotics.",
      headline: "Design · Simulate · Analyze · Build",
      heroCtaPrimaryLabel: "Explore Engineering Work",
      heroCtaSecondaryLabel: "Download CV",
      technicalStrip: [
        "SolidWorks",
        "ANSYS Fluent",
        "ANSYS Mechanical",
        "CAD",
        "CFD",
        "FEA",
        "Mechatronics",
      ],
      contactEmail: "tanbirhasan.mail@gmail.com",
      updatedAt: "2026-01-01T00:00:00Z",
    };
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .single();
    return data ? mapSiteSettings(data) : null;
  } catch {
    return null;
  }
}

// ── Profile ────────────────────────────────────────────────────────────────

export async function getAdminProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PROFILE;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "admin")
      .limit(1)
      .single();
    return data ? mapProfile(data) : FALLBACK_PROFILE;
  } catch {
    return FALLBACK_PROFILE;
  }
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PROFILE;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    return data ? mapProfile(data) : null;
  } catch {
    return null;
  }
}

// ── Skills ─────────────────────────────────────────────────────────────────

export async function getSkills(): Promise<Skill[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_SKILLS;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("skills")
      .select("*")
      .order("order_index", { ascending: true });
    if (!data || data.length === 0) {
      return FALLBACK_SKILLS;
    }
    return data.map(mapSkill);
  } catch {
    return FALLBACK_SKILLS;
  }
}

// ── Projects ───────────────────────────────────────────────────────────────

export async function getPublishedProjects(opts?: {
  category?: ProjectCategory;
  featured?: boolean;
  limit?: number;
}): Promise<Project[]> {
  if (!isSupabaseConfigured()) {
    let list = FALLBACK_PROJECTS.filter((p) => p.published);
    if (opts?.category) {
      list = list.filter((p) => p.category === opts.category);
    }
    if (opts?.featured !== undefined) {
      list = list.filter((p) => p.featured === opts.featured);
    }
    if (opts?.limit) {
      list = list.slice(0, opts.limit);
    }
    return list;
  }

  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true });

    if (opts?.category) {
      query = query.eq("category", opts.category);
    }
    if (opts?.featured !== undefined) {
      query = query.eq("featured", opts.featured);
    }
    if (opts?.limit) {
      query = query.limit(opts.limit);
    }

    const { data } = await query;
    if (!data || data.length === 0) {
      let list = FALLBACK_PROJECTS.filter((p) => p.published);
      if (opts?.category) list = list.filter((p) => p.category === opts.category);
      if (opts?.featured !== undefined) list = list.filter((p) => p.featured === opts.featured);
      if (opts?.limit) list = list.slice(0, opts.limit);
      return list;
    }
    return data.map(mapProject);
  } catch {
    let list = FALLBACK_PROJECTS.filter((p) => p.published);
    if (opts?.category) list = list.filter((p) => p.category === opts.category);
    if (opts?.featured !== undefined) list = list.filter((p) => p.featured === opts.featured);
    if (opts?.limit) list = list.slice(0, opts.limit);
    return list;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PROJECTS;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("order_index", { ascending: true });
    return (data ?? []).map(mapProject);
  } catch {
    return FALLBACK_PROJECTS;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single();
    if (!data) {
      return FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null;
    }
    return mapProject(data);
  } catch {
    return FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null;
  }
}

export async function getProjectWithAssets(slug: string): Promise<ProjectWithAssets | null> {
  const fallback = FALLBACK_PROJECTS.find((p) => p.slug === slug);
  if (!isSupabaseConfigured()) {
    return fallback ?? null;
  }

  try {
    const project = await getProjectBySlug(slug);
    if (!project) return fallback ?? null;

    const supabase = await createServerSupabaseClient();
    const { data: assetRows } = await supabase
      .from("project_assets")
      .select("*")
      .eq("project_id", project.id)
      .order("order_index", { ascending: true });

    return {
      ...project,
      assets: assetRows && assetRows.length > 0 ? assetRows.map(mapProjectAsset) : fallback?.assets ?? [],
    };
  } catch {
    return fallback ?? null;
  }
}

// ── Project Assets ─────────────────────────────────────────────────────────

export async function getProjectAssets(projectId: string) {
  if (!isSupabaseConfigured()) {
    const fallback = FALLBACK_PROJECTS.find((p) => p.id === projectId);
    return fallback?.assets ?? [];
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("project_assets")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });
    return (data ?? []).map(mapProjectAsset);
  } catch {
    return [];
  }
}

// ── Research ───────────────────────────────────────────────────────────────

export async function getPublishedResearch(): Promise<ResearchPaper[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_RESEARCH.filter((r) => r.published);
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("research_papers")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true });
    if (!data || data.length === 0) {
      return FALLBACK_RESEARCH.filter((r) => r.published);
    }
    return data.map(mapResearchPaper);
  } catch {
    return FALLBACK_RESEARCH.filter((r) => r.published);
  }
}

export async function getAllResearch(): Promise<ResearchPaper[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_RESEARCH;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("research_papers")
      .select("*")
      .order("order_index", { ascending: true });
    return (data ?? []).map(mapResearchPaper);
  } catch {
    return FALLBACK_RESEARCH;
  }
}

// ── Credentials ────────────────────────────────────────────────────────────

export async function getPublishedCredentials(): Promise<Credential[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_CREDENTIALS.filter((c) => c.published);
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("credentials")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true });
    if (!data || data.length === 0) {
      return FALLBACK_CREDENTIALS.filter((c) => c.published);
    }
    return data.map(mapCredential);
  } catch {
    return FALLBACK_CREDENTIALS.filter((c) => c.published);
  }
}

export async function getAllCredentials(): Promise<Credential[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_CREDENTIALS;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("credentials")
      .select("*")
      .order("order_index", { ascending: true });
    return (data ?? []).map(mapCredential);
  } catch {
    return FALLBACK_CREDENTIALS;
  }
}

// ── Engineering Media ──────────────────────────────────────────────────────

export async function getPublishedMedia(): Promise<EngineeringMedia[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_MEDIA.filter((m) => m.published);
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("engineering_media")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true });
    if (!data || data.length === 0) {
      return FALLBACK_MEDIA.filter((m) => m.published);
    }
    return data.map(mapEngineeringMedia);
  } catch {
    return FALLBACK_MEDIA.filter((m) => m.published);
  }
}

export async function getAllMedia(): Promise<EngineeringMedia[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_MEDIA;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("engineering_media")
      .select("*")
      .order("order_index", { ascending: true });
    return (data ?? []).map(mapEngineeringMedia);
  } catch {
    return FALLBACK_MEDIA;
  }
}

// ── Managed Files ──────────────────────────────────────────────────────────

export async function getManagedFiles(): Promise<ManagedFile[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("managed_files")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map(mapManagedFile);
  } catch {
    return [];
  }
}

// ── Contact Messages ───────────────────────────────────────────────────────

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map(mapContactMessage);
  } catch {
    return [];
  }
}

// ── Dashboard Counts ───────────────────────────────────────────────────────

export interface DashboardCounts {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  cadProjects: number;
  cfdProjects: number;
  feaProjects: number;
  roboticsProjects: number;
  researchPapers: number;
  credentials: number;
  mediaItems: number;
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  if (!isSupabaseConfigured()) {
    return {
      totalProjects: FALLBACK_PROJECTS.length,
      publishedProjects: FALLBACK_PROJECTS.filter((p) => p.published).length,
      draftProjects: 0,
      cadProjects: FALLBACK_PROJECTS.filter((p) => p.category === "cad").length,
      cfdProjects: FALLBACK_PROJECTS.filter((p) => p.category === "cfd").length,
      feaProjects: FALLBACK_PROJECTS.filter((p) => p.category === "fea").length,
      roboticsProjects: FALLBACK_PROJECTS.filter((p) => p.category === "robotics").length,
      researchPapers: FALLBACK_RESEARCH.length,
      credentials: FALLBACK_CREDENTIALS.length,
      mediaItems: FALLBACK_MEDIA.length,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const [
      { count: total },
      { count: published },
      { count: cad },
      { count: cfd },
      { count: fea },
      { count: robotics },
      { count: research },
      { count: creds },
      { count: media },
    ] = await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("published", true),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("category", "cad"),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("category", "cfd"),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("category", "fea"),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("category", "robotics"),
      supabase.from("research_papers").select("*", { count: "exact", head: true }),
      supabase.from("credentials").select("*", { count: "exact", head: true }),
      supabase.from("engineering_media").select("*", { count: "exact", head: true }),
    ]);

    return {
      totalProjects: total ?? FALLBACK_PROJECTS.length,
      publishedProjects: published ?? FALLBACK_PROJECTS.length,
      draftProjects: Math.max(0, (total ?? 0) - (published ?? 0)),
      cadProjects: cad ?? 1,
      cfdProjects: cfd ?? 1,
      feaProjects: fea ?? 1,
      roboticsProjects: robotics ?? 1,
      researchPapers: research ?? FALLBACK_RESEARCH.length,
      credentials: creds ?? FALLBACK_CREDENTIALS.length,
      mediaItems: media ?? FALLBACK_MEDIA.length,
    };
  } catch {
    return {
      totalProjects: FALLBACK_PROJECTS.length,
      publishedProjects: FALLBACK_PROJECTS.length,
      draftProjects: 0,
      cadProjects: 1,
      cfdProjects: 1,
      feaProjects: 1,
      roboticsProjects: 1,
      researchPapers: FALLBACK_RESEARCH.length,
      credentials: FALLBACK_CREDENTIALS.length,
      mediaItems: FALLBACK_MEDIA.length,
    };
  }
}
