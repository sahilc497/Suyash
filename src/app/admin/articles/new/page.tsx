"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    cover_image: "",
    reading_time: 5,
    is_published: true,
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    
    // Get current user to link as author
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("You must be logged in to create an article.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("articles").insert({
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category || null,
      cover_image: formData.cover_image || null,
      reading_time: formData.reading_time,
      is_published: formData.is_published,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111111]">Write New Article</h1>
        <p className="text-[#666666]">Draft a technical blog post or engineering thought piece.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Article Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="e.g. Understanding UART Communication"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">URL Slug</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] bg-[#f9f9f9] text-[#666666] focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="e.g. Embedded Systems"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Cover Image URL</label>
            <input
              type="url"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Reading Time (min)</label>
            <input
              type="number"
              min="1"
              required
              value={formData.reading_time}
              onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333333] mb-1">Short Excerpt</label>
          <input
            type="text"
            required
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            placeholder="A brief summary of the article..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333333] mb-1">Article Content (Markdown)</label>
          <textarea
            required
            rows={15}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors font-mono text-sm"
            placeholder="Write your article here using Markdown..."
          />
        </div>

        <div className="flex items-center gap-6 p-4 border border-[#dddddd] bg-white">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="is_published" className="text-sm font-semibold text-[#333333]">Publish immediately</label>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/articles")}
            className="px-6 py-2 border border-[#cccccc] text-[#555555] hover:bg-[#f9f9f9] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#111111] text-white hover:bg-[#333333] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
