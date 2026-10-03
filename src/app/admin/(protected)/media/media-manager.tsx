"use client";

import { useState } from "react";
import { Plus, Edit3, Trash2, X, Save, Film, Play } from "lucide-react";
import type { EngineeringMedia } from "@/types/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { saveMediaAction, deleteMediaAction } from "@/lib/cms/actions";
import { MEDIA_TYPES } from "@/types/enums";

export function MediaManager({ initialMedia }: { initialMedia: EngineeringMedia[] }) {
  const [mediaList, setMediaList] = useState(initialMedia);
  const [editingMedia, setEditingMedia] = useState<EngineeringMedia | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    await deleteMediaAction(id);
  };

  const handleClose = () => {
    setEditingMedia(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <span className="font-mono text-xs text-muted">
          Showing {mediaList.length} animations &amp; video captures
        </span>
        <Button onClick={() => setIsCreating(true)} size="sm" className="font-mono text-xs gap-1.5 bg-primary text-white">
          <Plus className="h-3.5 w-3.5" />
          Add Media Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mediaList.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-[9px] uppercase">
                  {item.mediaType.replace(/_/g, " ")}
                </Badge>
                {item.softwareUsed && (
                  <span className="font-mono text-[10px] text-muted">{item.softwareUsed}</span>
                )}
              </div>
              <h3 className="font-sans text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted font-sans line-clamp-2">{item.description}</p>
              <div className="font-mono text-[10px] text-primary truncate">
                File: {item.videoUrl || "None"}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className={`font-mono text-[10px] ${item.published ? "text-emerald-600 font-semibold" : "text-amber-600"}`}>
                {item.published ? "Published" : "Draft"}
              </span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setEditingMedia(item)} className="h-7 text-xs font-mono">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-muted hover:text-rose-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(isCreating || editingMedia) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-xl rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6">
            <button onClick={handleClose} className="absolute right-4 top-4 p-1.5 text-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold font-sans">
                {editingMedia ? "Edit Engineering Media" : "Add Animation / Motion Study"}
              </h2>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                await saveMediaAction(formData);
                setIsSubmitting(false);
                handleClose();
              }}
              className="space-y-4"
            >
              {editingMedia && <input type="hidden" name="id" value={editingMedia.id} />}

              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-mono text-xs">Media Title *</Label>
                <Input id="title" name="title" required defaultValue={editingMedia?.title} className="text-xs" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mediaType" className="font-mono text-xs">Media Type</Label>
                  <select id="mediaType" name="mediaType" defaultValue={editingMedia?.mediaType || "cfd_transient"} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono">
                    {MEDIA_TYPES.map((m) => (
                      <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="softwareUsed" className="font-mono text-xs">Software Used</Label>
                  <Input id="softwareUsed" name="softwareUsed" defaultValue={editingMedia?.softwareUsed || ""} placeholder="SolidWorks Motion / ANSYS" className="text-xs font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="videoUrl" className="font-mono text-xs">Video File URL (.mp4 / stream)</Label>
                  <Input id="videoUrl" name="videoUrl" defaultValue={editingMedia?.videoUrl || ""} className="text-xs font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="thumbnailUrl" className="font-mono text-xs">Thumbnail URL</Label>
                  <Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={editingMedia?.thumbnailUrl || ""} className="text-xs font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="font-mono text-xs">Description &amp; Mechanism Details</Label>
                <textarea id="description" name="description" rows={3} defaultValue={editingMedia?.description || ""} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-sans" />
              </div>

              <div className="flex items-center gap-2 pt-2 font-mono text-xs">
                <input type="checkbox" id="published" name="published" defaultChecked={editingMedia ? editingMedia.published : true} className="h-4 w-4 rounded accent-primary" />
                <Label htmlFor="published">Published to public website</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" type="button" onClick={handleClose} className="font-mono text-xs">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="font-mono text-xs gap-1.5 bg-primary text-white">
                  <Save className="h-3.5 w-3.5" />
                  {isSubmitting ? "Saving..." : "Save Media"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
