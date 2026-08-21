"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ImageIcon, ArrowLeft, Upload, FileCode2, Video, Plus, Trash2, 
  Layers, Wrench, ListOrdered, X, ArrowUp, ArrowDown 
} from "lucide-react";
import Link from "next/link";

interface ComponentItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  file?: File | null;
}

interface TutorialStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url: string;
  file?: File | null;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File Upload States for Cover & Architecture
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const [archFile, setArchFile] = useState<File | null>(null);
  const [archPreview, setArchPreview] = useState<string>("");

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Components & Tutorial Steps States
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);

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
    video_url: "",
    image_url: "",
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

  // Helper to upload single file directly to Supabase Storage Bucket `project-covers`
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

  // Handlers for Components
  const addComponentItem = () => {
    setComponents((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", description: "", image_url: "", file: null }
    ]);
  };

  const updateComponent = (id: string, field: keyof ComponentItem, value: any) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleComponentFile = (id: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, file, image_url: preview } : c))
      );
    };
    reader.readAsDataURL(file);
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  // Handlers for Tutorial Steps
  const addTutorialStep = () => {
    setTutorialSteps((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        step_number: prev.length + 1,
        title: `Step ${prev.length + 1}`,
        description: "",
        image_url: "",
        file: null,
      }
    ]);
  };

  const updateTutorialStep = (id: string, field: keyof TutorialStep, value: any) => {
    setTutorialSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleStepFile = (id: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setTutorialSteps((prev) =>
        prev.map((s) => (s.id === id ? { ...s, file, image_url: preview } : s))
      );
    };
    reader.readAsDataURL(file);
  };

  const removeStep = (id: string) => {
    setTutorialSteps((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s, i) => ({ ...s, step_number: i + 1 }));
    });
  };

  // Gallery handlers
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setGalleryFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setGalleryPreviews((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("You must be logged in to create a project.");
      setLoading(false);
      return;
    }

    // 1. Cover Image Upload (Optional)
    let finalCoverUrl = "";
    if (coverFile) {
      const uploadedUrl = await uploadToStorage(coverFile, "covers");
      if (uploadedUrl) finalCoverUrl = uploadedUrl;
    }

    // 2. Architecture Diagram Upload (Optional)
    let finalArchUrl = formData.architecture_url.trim();
    if (archFile) {
      const uploadedUrl = await uploadToStorage(archFile, "diagrams");
      if (uploadedUrl) finalArchUrl = uploadedUrl;
    }

    // 3. Components Image Uploads (Optional)
    const processedComponents = [];
    for (const comp of components) {
      let imgUrl = comp.image_url;
      if (comp.file) {
        const uploadedUrl = await uploadToStorage(comp.file, "components");
        if (uploadedUrl) imgUrl = uploadedUrl;
      }
      processedComponents.push({
        name: comp.name,
        description: comp.description,
        image_url: imgUrl || null,
      });
    }

    // 4. Tutorial Steps Image Uploads (Optional)
    const processedSteps = [];
    for (let i = 0; i < tutorialSteps.length; i++) {
      const step = tutorialSteps[i];
      let imgUrl = step.image_url;
      if (step.file) {
        const uploadedUrl = await uploadToStorage(step.file, "steps");
        if (uploadedUrl) imgUrl = uploadedUrl;
      }
      processedSteps.push({
        step_number: i + 1,
        title: step.title || `Step ${i + 1}`,
        description: step.description,
        image_url: imgUrl || null,
      });
    }

    // 5. Gallery Uploads (Optional)
    const uploadedGalleryUrls: string[] = [];
    for (const file of galleryFiles) {
      const url = await uploadToStorage(file, "gallery");
      if (url) uploadedGalleryUrls.push(url);
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
      architecture_url: finalArchUrl || null,
      video_url: formData.video_url || null,
      image_url: finalCoverUrl || null,
      gallery_images: uploadedGalleryUrls,
      components: processedComponents,
      tutorial_steps: processedSteps,
      is_featured: formData.is_featured,
      is_published: formData.is_published,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      window.location.href = "/admin/projects";
    }
  };

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8">
        <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-xs text-cool-slate hover:text-[#0f172a] font-semibold mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-[#111111] font-heading">Create New Project</h1>
        <p className="text-[#666666] text-sm mt-1">Publish hardware logs with components list, step-by-step tutorial steps & video links.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs">
        
        {/* BASIC PROJECT INFO */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#0f172a] border-b pb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-steel-blue" /> Basic Project Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
                placeholder="e.g. DIY 7-Channel RC Transmitter"
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

          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1">Short Description *</label>
            <input
              type="text"
              required
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="A brief summary of the build..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1">Project Video Link (YouTube URL - Optional)</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1">GitHub Source Code Link (Optional)</label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>

        {/* COVER & ARCHITECTURE IMAGES (OPTIONAL) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
              <Upload className="h-4 w-4 text-steel-blue" /> Cover Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setCoverFile(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
            />
            {coverPreview && (
              <div className="w-full aspect-video max-h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 mt-2">
                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-steel-blue" /> Architecture Diagram (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setArchFile(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => setArchPreview(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
            />
            <input
              type="url"
              value={formData.architecture_url}
              onChange={(e) => setFormData({ ...formData, architecture_url: e.target.value })}
              placeholder="Or enter diagram URL (https://...)"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
            />
            {archPreview && (
              <div className="w-full max-h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center mt-2">
                <img src={archPreview} alt="Diagram Preview" className="max-h-36 object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* SECTION: REQUIRED COMPONENTS (WITH OPTIONAL IMAGES) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                <Wrench className="h-4 w-4 text-steel-blue" /> Required Components & Hardware
              </h2>
              <p className="text-[11px] text-cool-slate">Add items needed for this project. Component images are optional.</p>
            </div>
            <button
              type="button"
              onClick={addComponentItem}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-steel-blue text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Component
            </button>
          </div>

          {components.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-cool-slate border border-dashed border-slate-200">
              No component list added yet. Click "+ Add Component" to add microcontrollers, sensors, or modules.
            </div>
          ) : (
            <div className="space-y-3">
              {components.map((comp, idx) => (
                <div key={comp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeComponent(comp.id)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                    title="Remove Component"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-cool-slate">
                    Component #{idx + 1}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0f172a] mb-1">Component Name *</label>
                      <input
                        type="text"
                        required
                        value={comp.name}
                        onChange={(e) => updateComponent(comp.id, "name", e.target.value)}
                        placeholder="e.g. Arduino Nano / NRF24L01 Module"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0f172a] mb-1">Description / Spec</label>
                      <input
                        type="text"
                        value={comp.description}
                        onChange={(e) => updateComponent(comp.id, "description", e.target.value)}
                        placeholder="e.g. 2.4GHz RF Transceiver with Antenna"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0f172a] mb-1">Component Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleComponentFile(comp.id, e.target.files?.[0] || null)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                    />
                    {comp.image_url && (
                      <div className="mt-2 h-20 w-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                        <img src={comp.image_url} alt={comp.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: STEP-BY-STEP TUTORIAL BUILD STEPS (WITH OPTIONAL IMAGES) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-steel-blue" /> Step-by-Step Tutorial & Assembly Guide
              </h2>
              <p className="text-[11px] text-cool-slate">Add sequential tutorial steps (Step 1, Step 2, etc.). Images are optional.</p>
            </div>
            <button
              type="button"
              onClick={addTutorialStep}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-steel-blue text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Step
            </button>
          </div>

          {tutorialSteps.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-cool-slate border border-dashed border-slate-200">
              No tutorial steps added yet. Click "+ Add Step" to build your step-by-step hardware tutorial.
            </div>
          ) : (
            <div className="space-y-4">
              {tutorialSteps.map((step, idx) => (
                <div key={step.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-steel-blue text-white text-[11px] font-extrabold">
                      Step {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove Step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0f172a] mb-1">Step Header / Title *</label>
                    <input
                      type="text"
                      required
                      value={step.title}
                      onChange={(e) => updateTutorialStep(step.id, "title", e.target.value)}
                      placeholder={`e.g. Step ${idx + 1}: Wiring the OLED Display`}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0f172a] mb-1">Step Details & Instructions *</label>
                    <textarea
                      rows={3}
                      required
                      value={step.description}
                      onChange={(e) => updateTutorialStep(step.id, "description", e.target.value)}
                      placeholder="Explain how to connect the wires, flash code, or assemble components..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0f172a] mb-1">Step Photo / Diagram (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleStepFile(step.id, e.target.files?.[0] || null)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                    />
                    {step.image_url && (
                      <div className="mt-2 aspect-video max-h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                        <img src={step.image_url} alt={step.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: MULTIPLE GALLERY IMAGES (OPTIONAL) */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <label className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-steel-blue" /> Upload Additional Build Gallery Photos (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
          />

          {galleryPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {galleryPreviews.map((src, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                  <img src={src} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: FULL BUILD NOTES */}
        <div>
          <label className="block text-xs font-bold text-[#0f172a] mb-1">Additional Build Notes / Markdown (Optional)</label>
          <textarea
            rows={8}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-4 rounded-xl border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors font-mono text-xs leading-relaxed"
            placeholder="### Code & Libraries&#10;Include any code snippets or additional troubleshooting tips..."
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
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-steel-blue text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            {loading ? "Publishing Project..." : "Publish Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
