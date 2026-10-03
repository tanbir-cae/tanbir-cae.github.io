/**
 * Row-mapper utilities.
 * Convert snake_case Supabase rows → camelCase TypeScript interfaces.
 */

import type { Database } from "@/types/database";
import type { Project, ProjectAsset, DesignSpecs, SimulationDetails, ProjectSectionFlags } from "@/types/project";
import type { ResearchPaper } from "@/types/research";
import type { Credential } from "@/types/credentials";
import type { EngineeringMedia } from "@/types/media";
import type { Profile, Skill } from "@/types/profile";
import type { SiteSettings, ContactMessage } from "@/types/site";
import type { ManagedFile } from "@/types/storage";
import { DEFAULT_SECTION_FLAGS } from "@/types/project";

// ── Type aliases for database rows ──────────────────────────────────────────

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type AssetRow = Database["public"]["Tables"]["project_assets"]["Row"];
type ResearchRow = Database["public"]["Tables"]["research_papers"]["Row"];
type CredentialRow = Database["public"]["Tables"]["credentials"]["Row"];
type MediaRow = Database["public"]["Tables"]["engineering_media"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SkillRow = Database["public"]["Tables"]["skills"]["Row"];
type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
type ManagedFileRow = Database["public"]["Tables"]["managed_files"]["Row"];

// ── Mappers ─────────────────────────────────────────────────────────────────

export function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    year: row.year,
    status: row.status,
    software: row.software,
    tools: row.tools,
    tags: row.tags,
    featured: row.featured,
    published: row.published,
    summary: row.summary,
    problemStatement: row.problem_statement,
    objective: row.objective,
    designSpecs: (row.design_specs as DesignSpecs) ?? null,
    engineeringApproach: row.engineering_approach,
    simulationDetails: (row.simulation_details as SimulationDetails) ?? null,
    resultsSummary: row.results_summary,
    validationSummary: row.validation_summary,
    conclusion: row.conclusion,
    thumbnailUrl: row.thumbnail_url,
    repositoryUrl: row.repository_url,
    externalUrl: row.external_url,
    githubUrl: row.github_url,
    sectionFlags: (row.section_flags as ProjectSectionFlags) ?? DEFAULT_SECTION_FLAGS,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProjectAsset(row: AssetRow): ProjectAsset {
  return {
    id: row.id,
    projectId: row.project_id,
    assetType: row.asset_type,
    title: row.title,
    fileUrl: row.file_url,
    storagePath: row.storage_path,
    fileSize: row.file_size ? Number(row.file_size) : null,
    mimeType: row.mime_type,
    viewerEnabled: row.viewer_enabled,
    downloadEnabled: row.download_enabled,
    visibility: row.visibility,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapResearchPaper(row: ResearchRow): ResearchPaper {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    authors: row.authors,
    venue: row.venue,
    year: row.year,
    abstract: row.abstract,
    keywords: row.keywords,
    doi: row.doi,
    pdfUrl: row.pdf_url,
    externalUrl: row.external_url,
    published: row.published,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCredential(row: CredentialRow): Credential {
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    badgeType: row.badge_type,
    issueDate: row.issue_date,
    credentialId: row.credential_id,
    verificationUrl: row.verification_url,
    imageUrl: row.image_url,
    documentUrl: row.document_url,
    published: row.published,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEngineeringMedia(row: MediaRow): EngineeringMedia {
  return {
    id: row.id,
    title: row.title,
    mediaType: row.media_type,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url,
    softwareUsed: row.software_used,
    description: row.description,
    published: row.published,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    professionalTitle: row.professional_title,
    biography: row.biography,
    profileImageUrl: row.profile_image_url,
    email: row.email,
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    scholarUrl: row.scholar_url,
    cvUrl: row.cv_url,
    role: row.role,
    updatedAt: row.updated_at,
  };
}

export function mapSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    group: row.group_name,
    orderIndex: row.order_index,
  };
}

export function mapSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    id: row.id,
    siteTitle: row.site_title,
    siteDescription: row.site_description,
    headline: row.headline,
    heroCtaPrimaryLabel: row.hero_cta_primary_label,
    heroCtaSecondaryLabel: row.hero_cta_secondary_label,
    technicalStrip: row.technical_strip,
    contactEmail: row.contact_email,
    updatedAt: row.updated_at,
  };
}

export function mapManagedFile(row: ManagedFileRow): ManagedFile {
  return {
    id: row.id,
    filename: row.filename,
    storageBucket: row.storage_bucket as ManagedFile["storageBucket"],
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    fileSize: row.file_size ? Number(row.file_size) : null,
    projectId: row.project_id,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapContactMessage(row: {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
  };
}
