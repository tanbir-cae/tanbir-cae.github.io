/**
 * Supabase Storage utilities.
 * Upload, delete, and URL helpers for engineering files.
 */
import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { StorageBucket } from "@/types/enums";
import type { UploadConstraints } from "@/types/storage";

// ── Constraints per bucket ─────────────────────────────────────────────────

export const BUCKET_CONSTRAINTS: Record<StorageBucket, UploadConstraints> = {
  "project-images": {
    maxBytes: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ],
  },
  "3d-models": {
    maxBytes: 100 * 1024 * 1024, // 100 MB
    allowedMimeTypes: [
      "model/gltf-binary",
      "model/gltf+json",
      "application/octet-stream",
      "application/sla",
      "application/step",
      "application/iges",
      "model/stl",
    ],
  },
  "engineering-media": {
    maxBytes: 50 * 1024 * 1024, // 50 MB
    allowedMimeTypes: [
      "video/mp4",
      "video/webm",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
    ],
  },
  documents: {
    maxBytes: 20 * 1024 * 1024, // 20 MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  certificates: {
    maxBytes: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
  },
};

// ── File extension → bucket heuristics ──────────────────────────────────────

const EXT_TO_BUCKET: Record<string, StorageBucket> = {
  // images
  ".png": "project-images",
  ".jpg": "project-images",
  ".jpeg": "project-images",
  ".webp": "project-images",
  ".gif": "project-images",
  ".svg": "project-images",
  // 3D
  ".glb": "3d-models",
  ".gltf": "3d-models",
  ".stl": "3d-models",
  ".sldprt": "3d-models",
  ".sldasm": "3d-models",
  ".slddrw": "3d-models",
  ".step": "3d-models",
  ".stp": "3d-models",
  ".iges": "3d-models",
  ".igs": "3d-models",
  // video
  ".mp4": "engineering-media",
  ".webm": "engineering-media",
  // docs
  ".pdf": "documents",
  ".doc": "documents",
  ".docx": "documents",
};

export function suggestBucket(filename: string): StorageBucket {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return EXT_TO_BUCKET[ext] ?? "documents";
}

// ── Validate upload ─────────────────────────────────────────────────────────

export function validateUpload(
  bucket: StorageBucket,
  fileSize: number,
  mimeType: string,
): { valid: boolean; error?: string } {
  const constraints = BUCKET_CONSTRAINTS[bucket];

  if (fileSize > constraints.maxBytes) {
    const maxMB = Math.round(constraints.maxBytes / (1024 * 1024));
    return { valid: false, error: `File exceeds maximum size of ${maxMB} MB.` };
  }

  // Be lenient with mime types for engineering files that often come as
  // application/octet-stream from the browser
  if (bucket === "3d-models") {
    return { valid: true };
  }

  if (!constraints.allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type "${mimeType}" is not allowed in the ${bucket} bucket.`,
    };
  }

  return { valid: true };
}

// ── Upload ──────────────────────────────────────────────────────────────────

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
  opts?: { upsert?: boolean; contentType?: string },
): Promise<{ url: string; storagePath: string } | { error: string }> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: opts?.upsert ?? false,
    contentType: opts?.contentType,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    storagePath: data.path,
  };
}

// ── Delete ──────────────────────────────────────────────────────────────────

export async function deleteFile(
  bucket: StorageBucket,
  paths: string[],
): Promise<{ error?: string }> {
  if (paths.length === 0) return {};

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    return { error: error.message };
  }
  return {};
}

// ── Signed URL (for private buckets like 3d-models, documents) ──────────────

export async function createSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600, // seconds
): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

// ── Public URL ──────────────────────────────────────────────────────────────

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// ── File size formatting ────────────────────────────────────────────────────

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes === 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
