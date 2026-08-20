"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, ArrowLeft, Save, FileCode2, ImageIcon, X } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File Upload States
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const [archFile, setArchFile] = useState<File | null>(null);
  const [archPreview, setArchPreview] = useState<string>("");

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    short_description: "",
    category: "Arduino & ESP32",
    content: "",
    difficulty: "Intermediate",
    status: "In Progress",
    progress: 0,
    github_url: "",
    architecture_url: "",
    image_url: "",
    is_featured: false,
    is_published: true,
  });

  // Fetch existing project details
  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Project not found.");
        setLoading(false);
      } else {
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          short_description: data.short_description || "",
          category: data.category || "Arduino & ESP32",
          content: data.content || "",
          difficulty: data.difficulty || "Intermediate",
          status: data.status || "In Progress",
          progress: data.progress || 0,
          github_url: data.github_url || "",
          architecture_url: data.architecture_url || "",
          image_url: data.image_url || "",
          is_featured: data.is_featured || false,
          is_published: data.is_published ?? true,
        });

        if (data.image_url) setCoverPreview(data.image_url);
        if (data.architecture_url) setArchPreview(data.architecture_url);
        if (data.gallery_images && Array.isArray(data.gallery_images)) {
          setExistingGallery(data.gallery_images);
        }
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setCoverPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleArchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setArchPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setGalleryFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewGalleryPreviews((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadToStorage = async (file: File, folder: string): Promise<string | null> => {
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from('project-covers')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error("Storage upload error:", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('project-covers')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Image upload exception:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();

    // 1. Cover Image Upload
    let finalCoverUrl = formData.image_url;
    if (coverFile) {
      const uploadedUrl = await uploadToStorage(coverFile, "covers");
      if (uploadedUrl) finalCoverUrl = uploadedUrl;
    }

    // 2. Architecture Diagram Upload
    let finalArchUrl = formData.architecture_url.trim();
    if (archFile) {
      const uploadedUrl = await uploadToStorage(archFile, "diagrams");
      if (uploadedUrl) finalArchUrl = uploadedUrl;
    }

    // 3. Gallery Images Upload
    const uploadedGalleryUrls: string[] = [...existingGallery];
    for (const file of galleryFiles) {
      const url = await uploadToStorage(file, "gallery");
      if (url) uploadedGalleryUrls.push(url);
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        title: formData.title,
        slug: formData.slug,
        short_description: formData.short_description,
        category: formData.category,
        content: formData.content,
        difficulty: formData.difficulty,
        status: formData.status,
        progress: formData.progress,
        github_url: formData.github_url || null,
        architecture_url: finalArchUrl || null,
        image_url: finalCoverUrl,
        gallery_images: uploadedGalleryUrls,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      window.location.href = "/admin/projects";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-cool-slate font-medium">
        Loading project details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8">
        <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-xs text-cool-slate hover:text-[#0f172a] font-semibold mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects List
        </Link>
        <h1 className="text-3xl font-bold text-[#111111] font-heading">Edit Project</h1>
        <p className="text-[#666666] text-sm mt-1">Update build logs, schematics, and project photo gallery.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1">URL Slug *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] bg-[#f9f9f9] text-[#666666] focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1">Category / Section *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="Arduino & ESP32">Arduino & ESP32</option>
              <option value="IoT">IoT</option>
              <option value="Embedded Systems">Embedded Systems</option>
              <option value="ECE">ECE</option>
              <option value="Robotics & Automation">Robotics & Automation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1">Difficulty Level</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* 1. COVER IMAGE FILE UPLOAD */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-[#0f172a] flex items-center gap-2">
            <Upload className="h-4 w-4 text-steel-blue" /> Upload New Cover Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
          />

          {coverPreview && (
            <div className="space-y-1 pt-1">
              <span className="block text-[11px] font-bold text-cool-slate">Current / New Cover Preview:</span>
              <div className="w-full aspect-video max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

        {/* 2. ARCHITECTURE DIAGRAM UPLOAD */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-[#0f172a] flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-steel-blue" /> Upload Architecture / Circuit Schematic Diagram
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleArchChange}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
          />

          {archPreview && (
            <div className="space-y-1 pt-1">
              <span className="block text-[11px] font-bold text-cool-slate">Architecture Diagram Preview:</span>
              <div className="w-full max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                <img src={archPreview} alt="Diagram Preview" className="max-h-48 object-contain" />
              </div>
            </div>
          )}
        </div>

        {/* 3. MULTIPLE GALLERY IMAGES UPLOAD */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-[#0f172a] flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-steel-blue" /> Upload Additional Project Photos / Build Gallery
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
          />

          {/* Existing Gallery Images */}
          {existingGallery.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="block text-[11px] font-bold text-cool-slate">Existing Gallery Images ({existingGallery.length}):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {existingGallery.map((src, index) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                    <img src={src} alt={`Existing Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                      title="Remove Image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Gallery Previews */}
          {newGalleryPreviews.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="block text-[11px] font-bold text-cool-slate">Newly Uploaded Images ({newGalleryPreviews.length}):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {newGalleryPreviews.map((src, index) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                    <img src={src} alt={`New Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                      title="Remove Image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0f172a] mb-1">Short Description *</label>
          <input
            type="text"
            required
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-[#0f172a] mb-1">GitHub Repo URL</label>
          <input
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0f172a] mb-1">Full Build Log (Markdown / Specs) *</label>
          <textarea
            required
            rows={12}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-4 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs font-bold text-[#0f172a] cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="rounded text-steel-blue"
            />
            Feature on Homepage
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-[#0f172a] cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="rounded text-steel-blue"
            />
            Publish Immediately
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-[#cccccc] text-xs font-bold text-[#475569] hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-steel-blue text-white text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving Changes..." : "Save Project Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
