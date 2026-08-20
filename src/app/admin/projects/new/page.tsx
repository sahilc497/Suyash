"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    is_featured: false,
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
      setError("You must be logged in to create a project.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("projects").insert({
      title: formData.title,
      slug: formData.slug,
      short_description: formData.short_description,
      category: formData.category,
      content: formData.content,
      difficulty: formData.difficulty,
      status: formData.status,
      progress: formData.progress,
      github_url: formData.github_url || null,
      architecture_url: formData.architecture_url || null,
      is_featured: formData.is_featured,
      is_published: formData.is_published,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push("/admin/projects");
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111111]">Create New Project</h1>
        <p className="text-[#666666]">Publish a new hardware build or engineering log.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Project Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="e.g. Autonomous Drone V2"
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

        <div>
          <label className="block text-sm font-semibold text-[#333333] mb-1">Short Description</label>
          <input
            type="text"
            required
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            placeholder="A brief summary of the build..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">GitHub Repo URL</label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Architecture Diagram URL</label>
            <input
              type="url"
              value={formData.architecture_url}
              onChange={(e) => setFormData({ ...formData, architecture_url: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333333] mb-1">Full Build Log (Markdown)</label>
          <textarea
            required
            rows={15}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors font-mono text-sm"
            placeholder="## Overview&#10;Write your build log here using Markdown..."
          />
        </div>

        <div className="flex flex-wrap gap-6 p-6 border border-[#dddddd] bg-white">
          <div className="flex-1 min-w-50">
            <label className="block text-sm font-semibold text-[#333333] mb-1">Category Section</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-[#cccccc] focus:outline-none font-medium"
            >
              <option value="Arduino & ESP32">Arduino & ESP32</option>
              <option value="IoT">IoT</option>
              <option value="Embedded Systems">Embedded Systems</option>
              <option value="ECE">ECE</option>
              <option value="Robotics & Automation">Robotics & Automation</option>
            </select>
          </div>

          <div className="flex-1 min-w-50">
            <label className="block text-sm font-semibold text-[#333333] mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-[#cccccc] focus:outline-none"
            >
              <option value="Concept">Concept</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-50">
            <label className="block text-sm font-semibold text-[#333333] mb-1">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-[#cccccc] focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-50">
            <label className="block text-sm font-semibold text-[#333333] mb-1">Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-[#cccccc] focus:outline-none"
            />
          </div>

          <div className="w-full flex items-center gap-6 pt-4 mt-2 border-t border-[#eeeeee]">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="is_featured" className="text-sm font-semibold text-[#333333]">Featured Project</label>
            </div>
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
        </div>

        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="px-6 py-2 border border-[#cccccc] text-[#555555] hover:bg-[#f9f9f9] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#111111] text-white hover:bg-[#333333] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
