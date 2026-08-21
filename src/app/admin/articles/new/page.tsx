"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, ArrowLeft, ImageIcon, FileText } from "lucide-react";
import Link from "next/link";

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File Upload State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Hardware Design",
    cover_image: "",
    reading_time: 5,
    is_published: true,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadCoverToSupabase = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `article_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      const { error } = await supabase.storage
        .from('article-covers')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error("Storage upload error:", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('article-covers')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Image upload exception:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("You must be logged in to create an article.");
      setLoading(false);
      return;
    }

    let finalCoverUrl = formData.cover_image.trim();

    if (coverFile) {
      const uploadedUrl = await uploadCoverToSupabase(coverFile);
      if (uploadedUrl) finalCoverUrl = uploadedUrl;
    } else if (coverPreview && coverPreview.length < 100000) {
      finalCoverUrl = coverPreview;
    }

    const cleanSlug = formData.slug
      .toLowerCase()
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const { error: insertError } = await supabase.from("articles").insert({
      title: formData.title,
      slug: cleanSlug || generateSlug(formData.title),
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category || "Hardware Design",
      cover_image: finalCoverUrl || null,
      reading_time: formData.reading_time,
      is_published: formData.is_published,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      window.location.href = "/admin/articles";
    }
  };

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8">
        <Link href="/admin/articles" className="inline-flex items-center gap-1.5 text-xs text-cool-slate hover:text-[#0f172a] font-semibold mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Articles List
        </Link>
        <h1 className="text-3xl font-bold text-[#111111] font-heading">Write New Article</h1>
        <p className="text-[#666666] text-sm mt-1">Draft a technical blog post or engineering guide.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1">Article Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="e.g. Understanding High-Speed PCB Layout"
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
            <label className="block text-xs font-bold text-[#0f172a] mb-1">Category *</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="e.g. Hardware Design / Embedded Systems"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1">Reading Time (minutes) *</label>
            <input
              type="number"
              min="1"
              required
              value={formData.reading_time}
              onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) || 1 })}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* COVER IMAGE UPLOAD SECTION */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-[#0f172a] flex items-center gap-2">
            <Upload className="h-4 w-4 text-steel-blue" /> Upload Article Cover Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
          />
          <input
            type="url"
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            placeholder="Or enter direct image URL (https://...)"
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-steel-blue"
          />

          {coverPreview && (
            <div className="space-y-1 pt-1">
              <span className="block text-[11px] font-bold text-cool-slate">Cover Image Preview:</span>
              <div className="w-full aspect-video max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0f172a] mb-1">Short Excerpt *</label>
          <input
            type="text"
            required
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            placeholder="A brief summary of the article..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0f172a] mb-1">Article Content (Markdown) *</label>
          <textarea
            required
            rows={15}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-4 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors font-mono text-xs leading-relaxed"
            placeholder="### Introduction&#10;Write your article body using markdown..."
          />
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
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
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-steel-blue text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            {loading ? "Publishing Article..." : "Publish Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
