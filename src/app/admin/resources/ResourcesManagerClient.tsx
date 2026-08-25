"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Image as ImageIcon, Check, X, ExternalLink, AlertCircle, FileText, Download, Tag } from "lucide-react";
import { ResourceItem } from "@/app/admin/resources/page";

export default function ResourcesManagerClient({ initialResources }: { initialResources: ResourceItem[] }) {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form image previews
  const [newImagePreview, setNewImagePreview] = useState<string>("");
  const [editImagePreview, setEditImagePreview] = useState<string>("");

  // File objects for cover images
  const [newFile, setNewFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

  // Sync resources from Supabase DB on mount
  useEffect(() => {
    const syncResources = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("resources")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setResources(data as ResourceItem[]);
        }
      } catch (e) {
        console.error("Failed to sync resources from Supabase:", e);
      }
    };
    syncResources();
  }, []);

  // Convert uploaded cover image file to Data URL preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEdit) {
      setEditFile(file);
    } else {
      setNewFile(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isEdit) {
        setEditImagePreview(result);
      } else {
        setNewImagePreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to upload image file to Supabase Storage bucket 'resource-covers'
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `resource_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error } = await supabase.storage
        .from('resource-covers')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error("Storage upload error:", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('resource-covers')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Image upload exception:", err);
      return null;
    }
  };

  // Create Resource in Supabase DB
  const handleCreateResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string || "").trim();
    const detail_text = (formData.get("detail_text") as string || "").trim();
    const category = (formData.get("category") as string || "General").trim();
    const download_url = (formData.get("download_url") as string || "").trim();
    const fallbackUrl = (formData.get("cover_image_fallback") as string || "").trim();
    const is_published = formData.get("is_published") === "on";

    let finalCoverUrl = "";

    // 1. Upload cover image to Supabase storage if file selected
    if (newFile) {
      const uploadedUrl = await uploadImageToSupabase(newFile);
      if (uploadedUrl) finalCoverUrl = uploadedUrl;
    }

    // 2. Try typed fallback URL
    if (!finalCoverUrl && fallbackUrl) {
      finalCoverUrl = fallbackUrl;
    }

    // 3. Try Data URL preview if concise
    if (!finalCoverUrl && newImagePreview && newImagePreview.length < 100000) {
      finalCoverUrl = newImagePreview;
    }

    // 4. Fallback default image
    if (!finalCoverUrl) {
      finalCoverUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("resources")
      .insert({
        title,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        cover_image: finalCoverUrl,
        detail_text,
        category,
        download_url,
        is_published,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting resource in Supabase:", error);
      setErrorMessage(`Failed to save to Database: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    if (data) {
      setResources([data as ResourceItem, ...resources]);
    } else {
      const mockResource: ResourceItem = {
        id: `res-${Date.now()}`,
        title,
        cover_image: finalCoverUrl,
        detail_text,
        category,
        download_url,
        is_published,
        created_at: new Date().toISOString(),
      };
      setResources([mockResource, ...resources]);
    }

    setIsSubmitting(false);
    setIsNewModalOpen(false);
    setNewImagePreview("");
    setNewFile(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Update Resource in Supabase DB
  const handleUpdateResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingResource) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string || editingResource.title).trim();
    const detail_text = (formData.get("detail_text") as string || editingResource.detail_text).trim();
    const category = (formData.get("category") as string || editingResource.category || "General").trim();
    const download_url = (formData.get("download_url") as string || editingResource.download_url || "").trim();
    const is_published = formData.get("is_published") === "on";

    let finalCoverUrl = editingResource.cover_image || "";

    if (editFile) {
      const uploadedUrl = await uploadImageToSupabase(editFile);
      if (uploadedUrl) finalCoverUrl = uploadedUrl;
    } else if (editImagePreview && !editImagePreview.startsWith("data:")) {
      finalCoverUrl = editImagePreview;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("resources")
      .update({
        title,
        cover_image: finalCoverUrl,
        detail_text,
        category,
        download_url,
        is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingResource.id);

    if (error) {
      console.error("Error updating resource in Supabase:", error);
      setErrorMessage(`Failed to update Database: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    const updatedResource: ResourceItem = {
      ...editingResource,
      title,
      cover_image: finalCoverUrl,
      detail_text,
      category,
      download_url,
      is_published,
      updated_at: new Date().toISOString(),
    };

    setResources(resources.map(r => r.id === editingResource.id ? updatedResource : r));

    setIsSubmitting(false);
    setEditingResource(null);
    setEditImagePreview("");
    setEditFile(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Delete Resource
  const handleDeleteResource = async (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      const supabase = createClient();
      await supabase.from("resources").delete().eq("id", id);
      setResources(resources.filter(r => r.id !== id));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  // Toggle Publication status
  const togglePublished = async (id: string) => {
    const item = resources.find(r => r.id === id);
    if (!item) return;

    const nextPublishedState = !item.is_published;
    const supabase = createClient();
    await supabase.from("resources").update({ is_published: nextPublishedState }).eq("id", id);

    setResources(resources.map(r => r.id === id ? { ...r, is_published: nextPublishedState } : r));
  };

  return (
    <div className="space-y-6">

      {/* Notifications */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm flex items-center gap-2 font-medium shadow-xs">
          <Check className="h-5 w-5 text-emerald-600" /> Resource updated successfully!
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-sm flex items-center gap-2 font-medium shadow-xs">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" /> {errorMessage}
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-[#dddddd] shadow-xs gap-3">
        <div>
          <p className="text-sm font-medium text-[#555555]">
            Total Resources: <span className="font-bold text-[#111111]">{resources.length}</span> | Published: <span className="font-bold text-emerald-600">{resources.filter(r => r.is_published).length}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setNewImagePreview("");
            setNewFile(null);
            setIsNewModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add New Resource
        </button>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className={`bg-white border rounded-xl overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
              resource.is_published ? "border-[#dddddd]" : "border-amber-200 bg-amber-50/20 opacity-80"
            }`}
          >
            <div>
              {/* Cover Image Banner */}
              <div className="relative h-48 bg-[#111111] overflow-hidden">
                <img
                  src={resource.cover_image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-xs text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded">
                  {resource.category || "General"}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-base line-clamp-1 leading-snug">{resource.title}</h3>
                </div>
              </div>

              {/* Resource Info */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-[#555555] line-clamp-3 leading-relaxed">
                  {resource.detail_text}
                </p>

                {resource.download_url && (
                  <a
                    href={resource.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" /> Resource Link <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-3 bg-[#fafafa] border-t border-[#eeeeee] flex items-center justify-between">
              <button
                onClick={() => togglePublished(resource.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  resource.is_published
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                }`}
              >
                {resource.is_published ? "● Published" : "○ Draft / Hidden"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingResource(resource);
                    setEditImagePreview(resource.cover_image || "");
                  }}
                  className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-[#eeeeee] rounded transition-colors cursor-pointer"
                  title="Edit Resource"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteResource(resource.id)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Delete Resource"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW RESOURCE MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#dddddd] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" /> Upload New Resource
              </h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. ESP32 Pinout Cheat Sheet & Hardware Reference"
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Category Tag *
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue="Cheat Sheet"
                    required
                    placeholder="e.g. Cheat Sheet, CAD, Guide"
                    className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Download / External Link
                  </label>
                  <input
                    type="url"
                    name="download_url"
                    placeholder="https://github.com/..."
                    className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Detail Text / Description *
                </label>
                <textarea
                  name="detail_text"
                  rows={4}
                  required
                  placeholder="Detailed breakdown of this resource, what it covers, and how engineers can use it..."
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Cover Image File (Upload to Supabase Storage)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                  className="w-full text-xs p-2 border border-[#cccccc] rounded bg-[#fafafa] mb-2 cursor-pointer"
                />
                <input
                  type="text"
                  name="cover_image_fallback"
                  placeholder="Or enter image URL (e.g. https://images.unsplash.com/...)"
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Cover Preview */}
              {newImagePreview && (
                <div className="h-32 bg-[#111111] rounded overflow-hidden relative border border-[#dddddd]">
                  <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    Cover Preview
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_published_new"
                  name="is_published"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                />
                <label htmlFor="is_published_new" className="text-xs font-semibold text-[#333333] cursor-pointer">
                  Publish resource immediately to public site
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-[#cccccc] text-xs font-medium rounded hover:bg-[#eeeeee] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Uploading & Saving..." : "Save & Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RESOURCE MODAL */}
      {editingResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#dddddd] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" /> Edit Resource
              </h2>
              <button onClick={() => setEditingResource(null)} className="text-[#888888] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingResource.title}
                  required
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Category Tag *
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingResource.category || "General"}
                    required
                    className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Download / External Link
                  </label>
                  <input
                    type="url"
                    name="download_url"
                    defaultValue={editingResource.download_url || ""}
                    className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Detail Text / Description *
                </label>
                <textarea
                  name="detail_text"
                  rows={4}
                  defaultValue={editingResource.detail_text}
                  required
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Replace Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="w-full text-xs p-2 border border-[#cccccc] rounded bg-[#fafafa] cursor-pointer"
                />
              </div>

              {/* Cover Preview */}
              {(editImagePreview || editingResource.cover_image) && (
                <div className="h-32 bg-[#111111] rounded overflow-hidden relative border border-[#dddddd]">
                  <img src={editImagePreview || editingResource.cover_image} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    Current Cover
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_published_edit"
                  name="is_published"
                  defaultChecked={editingResource.is_published}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                />
                <label htmlFor="is_published_edit" className="text-xs font-semibold text-[#333333] cursor-pointer">
                  Publicly visible on site
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 border border-[#cccccc] text-xs font-medium rounded hover:bg-[#eeeeee] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
