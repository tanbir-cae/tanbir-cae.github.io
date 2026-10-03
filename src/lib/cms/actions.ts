"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import type { ProjectCategory, ProjectStatus, ResearchKind, CredentialBadgeType, MediaType } from "@/types/enums";

// ── PROJECT CMS ACTIONS ───────────────────────────────────────────────────

export async function saveProjectAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim() || title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const category = (formData.get("category")?.toString() || "cad") as ProjectCategory;
  const status = (formData.get("status")?.toString() || "completed") as ProjectStatus;
  const year = formData.get("year")?.toString().trim() || new Date().getFullYear().toString();
  const published = formData.get("published") === "true" || formData.get("published") === "on";
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";

  const softwareRaw = formData.get("software")?.toString() || "";
  const software = softwareRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const tagsRaw = formData.get("tags")?.toString() || "";
  const tags = tagsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const summary = formData.get("summary")?.toString().trim() || null;
  const problemStatement = formData.get("problemStatement")?.toString().trim() || null;
  const objective = formData.get("objective")?.toString().trim() || null;
  const conclusion = formData.get("conclusion")?.toString().trim() || null;
  const validation = formData.get("validation")?.toString().trim() || null;

  // Design Specs
  const dimensions = formData.get("spec_dimensions")?.toString().trim() || undefined;
  const materials = formData.get("spec_materials")?.toString().trim() || undefined;
  const operatingConditions = formData.get("spec_operatingConditions")?.toString().trim() || undefined;
  const loads = formData.get("spec_loads")?.toString().trim() || undefined;
  const constraints = formData.get("spec_constraints")?.toString().trim() || undefined;
  const manufacturing = formData.get("spec_manufacturing")?.toString().trim() || undefined;

  const designSpecs = {
    dimensions,
    materials,
    operatingConditions,
    loads,
    constraints,
    manufacturingConsiderations: manufacturing,
  };

  // Simulation Details
  const solver = formData.get("sim_solver")?.toString().trim() || undefined;
  const physics = formData.get("sim_physics")?.toString().trim() || undefined;
  const turbulenceModel = formData.get("sim_turbulenceModel")?.toString().trim() || undefined;
  const mesh = formData.get("sim_mesh")?.toString().trim() || undefined;
  const boundaryConditions = formData.get("sim_boundaryConditions")?.toString().trim() || undefined;
  const loadCases = formData.get("sim_loadCases")?.toString().trim() || undefined;
  const material = formData.get("sim_material")?.toString().trim() || undefined;

  const simulationDetails = {
    solver,
    physics,
    turbulenceModel,
    mesh,
    boundaryConditions,
    loadCases,
    material,
  };

  const projectPayload = {
    title: title || "Untitled Project",
    slug: slug || "project",
    category,
    status,
    year,
    software,
    tags,
    summary,
    problem_statement: problemStatement,
    objective,
    design_specs: designSpecs,
    simulation_details: simulationDetails,
    validation_summary: validation,
    conclusion,
    published,
    featured,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (id) {
        await supabase.from("projects").update(projectPayload).eq("id", id);
      } else {
        await supabase.from("projects").insert({
          ...projectPayload,
          order_index: 0,
        });
      }
    } catch (e) {
      console.error("Supabase project save error:", e);
    }
  }

  revalidatePath("/work");
  revalidatePath(`/work/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function toggleProjectPublishAction(id: string, currentPublished: boolean) {
  await requireAdmin();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase
        .from("projects")
        .update({ published: !currentPublished, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch (e) {
      console.error("Error toggling project publish state:", e);
    }
  }

  revalidatePath("/work");
  revalidatePath("/");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.from("projects").delete().eq("id", id);
    } catch (e) {
      console.error("Error deleting project:", e);
    }
  }

  revalidatePath("/work");
  revalidatePath("/");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

// ── RESEARCH CMS ACTIONS ──────────────────────────────────────────────────

export async function saveResearchAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim() || "Untitled Paper";
  const kind = (formData.get("kind")?.toString() || "journal_paper") as ResearchKind;
  const venue = formData.get("venue")?.toString().trim() || null;
  const year = formData.get("year")?.toString().trim() || new Date().getFullYear().toString();
  const abstract = formData.get("abstract")?.toString().trim() || null;
  const doi = formData.get("doi")?.toString().trim() || null;
  const pdfUrl = formData.get("pdfUrl")?.toString().trim() || null;
  const externalUrl = formData.get("externalUrl")?.toString().trim() || null;
  const published = formData.get("published") === "true" || formData.get("published") === "on";

  const authorsRaw = formData.get("authors")?.toString() || "Md. Tanbir Hasan";
  const authors = authorsRaw.split(",").map((a) => a.trim()).filter(Boolean);

  const keywordsRaw = formData.get("keywords")?.toString() || "";
  const keywords = keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean);

  const payload = {
    title,
    kind,
    venue,
    year,
    abstract,
    doi,
    pdf_url: pdfUrl,
    external_url: externalUrl,
    authors,
    keywords,
    published,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (id) {
        await supabase.from("research_papers").update(payload).eq("id", id);
      } else {
        await supabase.from("research_papers").insert({
          ...payload,
          order_index: 0,
        });
      }
    } catch (e) {
      console.error("Error saving research paper:", e);
    }
  }

  revalidatePath("/research");
  revalidatePath("/");
  revalidatePath("/admin/research");
  return { success: true };
}

export async function deleteResearchAction(id: string) {
  await requireAdmin();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.from("research_papers").delete().eq("id", id);
    } catch (e) {
      console.error("Error deleting research paper:", e);
    }
  }

  revalidatePath("/research");
  revalidatePath("/");
  revalidatePath("/admin/research");
  return { success: true };
}

// ── CREDENTIAL CMS ACTIONS ────────────────────────────────────────────────

export async function saveCredentialAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim() || "Credential Title";
  const issuer = formData.get("issuer")?.toString().trim() || null;
  const badgeType = (formData.get("badgeType")?.toString() || "certification") as CredentialBadgeType;
  const issueDate = formData.get("issueDate")?.toString().trim() || null;
  const credentialId = formData.get("credentialId")?.toString().trim() || null;
  const verificationUrl = formData.get("verificationUrl")?.toString().trim() || null;
  const published = formData.get("published") === "true" || formData.get("published") === "on";

  const payload = {
    title,
    issuer,
    badge_type: badgeType,
    issue_date: issueDate,
    credential_id: credentialId,
    verification_url: verificationUrl,
    published,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (id) {
        await supabase.from("credentials").update(payload).eq("id", id);
      } else {
        await supabase.from("credentials").insert({
          ...payload,
          order_index: 0,
        });
      }
    } catch (e) {
      console.error("Error saving credential:", e);
    }
  }

  revalidatePath("/credentials");
  revalidatePath("/");
  revalidatePath("/admin/credentials");
  return { success: true };
}

export async function deleteCredentialAction(id: string) {
  await requireAdmin();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.from("credentials").delete().eq("id", id);
    } catch (e) {
      console.error("Error deleting credential:", e);
    }
  }

  revalidatePath("/credentials");
  revalidatePath("/");
  revalidatePath("/admin/credentials");
  return { success: true };
}

// ── MEDIA CMS ACTIONS ─────────────────────────────────────────────────────

export async function saveMediaAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim() || "Animation / Motion Study";
  const mediaType = (formData.get("mediaType")?.toString() || "cfd_transient") as MediaType;
  const videoUrl = formData.get("videoUrl")?.toString().trim() || null;
  const thumbnailUrl = formData.get("thumbnailUrl")?.toString().trim() || null;
  const softwareUsed = formData.get("softwareUsed")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim() || null;
  const published = formData.get("published") === "true" || formData.get("published") === "on";

  const payload = {
    title,
    media_type: mediaType,
    video_url: videoUrl,
    thumbnail_url: thumbnailUrl,
    software_used: softwareUsed,
    description,
    published,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (id) {
        await supabase.from("engineering_media").update(payload).eq("id", id);
      } else {
        await supabase.from("engineering_media").insert({
          ...payload,
          order_index: 0,
        });
      }
    } catch (e) {
      console.error("Error saving engineering media:", e);
    }
  }

  revalidatePath("/media");
  revalidatePath("/");
  revalidatePath("/admin/media");
  return { success: true };
}

export async function deleteMediaAction(id: string) {
  await requireAdmin();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.from("engineering_media").delete().eq("id", id);
    } catch (e) {
      console.error("Error deleting media item:", e);
    }
  }

  revalidatePath("/media");
  revalidatePath("/");
  revalidatePath("/admin/media");
  return { success: true };
}

// ── PROFILE CMS ACTIONS ───────────────────────────────────────────────────

export async function saveProfileAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const fullName = formData.get("fullName")?.toString().trim() || "Md. Tanbir Hasan";
  const professionalTitle = formData.get("professionalTitle")?.toString().trim() || "Mechanical Design & CAE Engineer";
  const biography = formData.get("biography")?.toString().trim() || null;
  const email = formData.get("email")?.toString().trim() || "tanbirhasan.mail@gmail.com";
  const linkedinUrl = formData.get("linkedinUrl")?.toString().trim() || null;
  const githubUrl = formData.get("githubUrl")?.toString().trim() || null;
  const scholarUrl = formData.get("scholarUrl")?.toString().trim() || null;
  const cvUrl = formData.get("cvUrl")?.toString().trim() || null;

  const payload = {
    id: user.id,
    full_name: fullName,
    professional_title: professionalTitle,
    biography,
    email,
    linkedin_url: linkedinUrl,
    github_url: githubUrl,
    scholar_url: scholarUrl,
    cv_url: cvUrl,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    } catch (e) {
      console.error("Error saving profile:", e);
    }
  }

  revalidatePath("/about");
  revalidatePath("/cv");
  revalidatePath("/");
  revalidatePath("/admin/profile");
}

