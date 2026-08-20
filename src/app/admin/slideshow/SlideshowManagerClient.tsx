"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseYouTubeUrl } from "@/lib/youtube";
import { Plus, Edit2, Trash2, Video, Image as ImageIcon, Check, X, ExternalLink, AlertCircle } from "lucide-react";

interface SlideItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url: string;
  display_order: number;
  is_active: boolean;
}

export default function SlideshowManagerClient({ initialSlides }: { initialSlides: SlideItem[] }) {
  const [slides, setSlides] = useState<SlideItem[]>(initialSlides);
  const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form previews
  const [newImagePreview, setNewImagePreview] = useState<string>("");
  const [newVideoUrl, setNewVideoUrl] = useState<string>("");
  
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editVideoUrl, setEditVideoUrl] = useState<string>("");

  // File objects
  const [newFile, setNewFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

  // Sync slides from Supabase DB on mount
  useEffect(() => {
    const syncSlides = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("slideshow_slides")
          .select("*")
          .order("display_order", { ascending: true });

        if (data && data.length > 0) {
          setSlides(data as SlideItem[]);
        }
      } catch (e) {
        console.error("Failed to sync slides from Supabase:", e);
      }
    };
    syncSlides();
  }, []);

  // Convert uploaded image file to Data URL and store File object
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

  // Helper to upload image file to Supabase Storage bucket
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `slideshow/${fileName}`;

      const { data, error } = await supabase.storage
        .from('slideshow-images')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error("Storage upload error:", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('slideshow-images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Image upload exception:", err);
      return null;
    }
  };

  // Create Slide in Supabase DB
  const handleCreateSlide = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string || "New Build Slide";
    const description = formData.get("description") as string || "";
    const category = formData.get("category") as string || "EMBEDDED HARDWARE";
    const video_url = (formData.get("video_url") as string || "").trim();
    const fallbackUrl = (formData.get("image_url_fallback") as string || "").trim();

    let finalImageUrl = "";

    // 1. Try file upload to Supabase storage
    if (newFile) {
      const uploadedUrl = await uploadImageToSupabase(newFile);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }

    // 2. Try Data URL preview if storage upload wasn't used
    if (!finalImageUrl && newImagePreview) {
      finalImageUrl = newImagePreview;
    }

    // 3. Try typed fallback image URL
    if (!finalImageUrl && fallbackUrl) {
      finalImageUrl = fallbackUrl;
    }

    // 4. Auto grab YouTube thumbnail if video URL is provided
    if (!finalImageUrl && video_url) {
      const { thumbnailUrl } = parseYouTubeUrl(video_url);
      if (thumbnailUrl) finalImageUrl = thumbnailUrl;
    }

    // 5. Final fallback default image
    if (!finalImageUrl) {
      finalImageUrl = "/circuit-schematic.jpg";
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("slideshow_slides")
      .insert({
        title,
        description,
        category,
        image_url: finalImageUrl,
        video_url,
        display_order: slides.length + 1,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting slide in Supabase:", error);
      setErrorMessage(`Failed to save to Database: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    if (data) {
      setSlides([...slides, data as SlideItem]);
    }

    try {
      localStorage.setItem("buildpulse_slideshow_slides", JSON.stringify([...slides, data]));
      window.dispatchEvent(new Event("slideshow_updated"));
    } catch (err) {
      console.error(err);
    }

    setIsSubmitting(false);
    setIsNewModalOpen(false);
    setNewImagePreview("");
    setNewFile(null);
    setNewVideoUrl("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Update Slide in Supabase DB
  const handleUpdateSlide = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSlide) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string || editingSlide.title;
    const description = formData.get("description") as string || editingSlide.description;
    const category = formData.get("category") as string || editingSlide.category;
    const video_url = (formData.get("video_url") as string || editingSlide.video_url || "").trim();

    let finalImageUrl = editingSlide.image_url;

    // 1. Try file upload to Supabase storage
    if (editFile) {
      const uploadedUrl = await uploadImageToSupabase(editFile);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    } else if (editImagePreview) {
      finalImageUrl = editImagePreview;
    }

    // Auto grab YouTube thumbnail if image is default/empty
    if ((!finalImageUrl || finalImageUrl === "/circuit-schematic.jpg") && video_url) {
      const { thumbnailUrl } = parseYouTubeUrl(video_url);
      if (thumbnailUrl) finalImageUrl = thumbnailUrl;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("slideshow_slides")
      .update({
        title,
        description,
        category,
        image_url: finalImageUrl,
        video_url,
      })
      .eq("id", editingSlide.id);

    if (error) {
      console.error("Error updating slide in Supabase:", error);
      setErrorMessage(`Failed to update Database: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    const updatedSlide: SlideItem = {
      ...editingSlide,
      title,
      description,
      category,
      image_url: finalImageUrl,
      video_url,
    };

    const updatedList = slides.map(s => s.id === editingSlide.id ? updatedSlide : s);
    setSlides(updatedList);

    try {
      localStorage.setItem("buildpulse_slideshow_slides", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("slideshow_updated"));
    } catch (err) {
      console.error(err);
    }

    setIsSubmitting(false);
    setEditingSlide(null);
    setEditImagePreview("");
    setEditFile(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Delete Slide from Supabase DB
  const handleDeleteSlide = async (id: string) => {
    if (confirm("Are you sure you want to remove this slide from the hero slideshow?")) {
      const supabase = createClient();
      await supabase.from("slideshow_slides").delete().eq("id", id);

      const updatedList = slides.filter(s => s.id !== id);
      setSlides(updatedList);

      try {
        localStorage.setItem("buildpulse_slideshow_slides", JSON.stringify(updatedList));
        window.dispatchEvent(new Event("slideshow_updated"));
      } catch (err) {
        console.error(err);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  // Toggle Active Slide in Supabase DB
  const toggleActive = async (id: string) => {
    const slideToToggle = slides.find(s => s.id === id);
    if (!slideToToggle) return;

    const newActiveState = !slideToToggle.is_active;

    const supabase = createClient();
    await supabase
      .from("slideshow_slides")
      .update({ is_active: newActiveState })
      .eq("id", id);

    const updatedList = slides.map(s => s.id === id ? { ...s, is_active: newActiveState } : s);
    setSlides(updatedList);

    try {
      localStorage.setItem("buildpulse_slideshow_slides", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("slideshow_updated"));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm flex items-center gap-2 font-medium shadow-xs">
          <Check className="h-5 w-5 text-emerald-600" /> Hero Slideshow updated successfully!
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-sm flex items-center gap-2 font-medium shadow-xs">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" /> {errorMessage}
        </div>
      )}

      {/* Header bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#dddddd] shadow-xs">
        <p className="text-sm font-medium text-[#555555]">
          Active Slides: <span className="font-bold text-[#111111]">{slides.filter(s => s.is_active).length} / {slides.length}</span>
        </p>
        <button
          onClick={() => {
            setNewImagePreview("");
            setNewFile(null);
            setNewVideoUrl("");
            setIsNewModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add New Build Slide
        </button>
      </div>

      {/* Slides List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slides.map((slide) => (
          <div 
            key={slide.id} 
            className={`bg-white border rounded-xl overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
              slide.is_active ? "border-[#dddddd]" : "border-red-200 bg-red-50/20 opacity-75"
            }`}
          >
            <div>
              {/* Image Preview Banner */}
              <div className="relative h-44 bg-[#111111] overflow-hidden">
                <img 
                  src={slide.image_url || "/circuit-schematic.jpg"} 
                  alt={slide.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-mono font-bold px-2.5 py-1 rounded">
                  {slide.category}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-base line-clamp-1">{slide.title}</h3>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-4 space-y-2">
                <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
                  {slide.description}
                </p>

                {slide.video_url && (
                  <a 
                    href={slide.video_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium pt-1"
                  >
                    <Video className="h-3.5 w-3.5" /> Watch Video <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-3 bg-[#fafafa] border-t border-[#eeeeee] flex items-center justify-between">
              <button
                onClick={() => toggleActive(slide.id.toString())}
                className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  slide.is_active 
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {slide.is_active ? "● Active on Hero" : "○ Hidden"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingSlide(slide);
                    setEditImagePreview(slide.image_url);
                    setEditVideoUrl(slide.video_url || "");
                  }}
                  className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-[#eeeeee] rounded transition-colors cursor-pointer"
                  title="Edit Slide"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteSlide(slide.id.toString())}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Delete Slide"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW SLIDE MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#dddddd]">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-600" /> Add Hero Build Slide
              </h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlide} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Slide Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. ESP32 Handheld Gaming Console"
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Category Tag *
                </label>
                <input
                  type="text"
                  name="category"
                  defaultValue="EMBEDDED HARDWARE"
                  required
                  placeholder="e.g. EMBEDDED HARDWARE, AUTONOMOUS ROBOTICS"
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Short Description *
                </label>
                <textarea
                  name="description"
                  rows={2}
                  required
                  placeholder="Brief summary of the build showcase..."
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  YouTube Video Link (Auto-generates thumbnail if no image is uploaded)
                </label>
                <input
                  type="url"
                  name="video_url"
                  value={newVideoUrl}
                  onChange={(e) => {
                    setNewVideoUrl(e.target.value);
                    if (!newImagePreview) {
                      const { thumbnailUrl } = parseYouTubeUrl(e.target.value);
                      if (thumbnailUrl) setNewImagePreview(thumbnailUrl);
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Upload Slide Banner Image OR Paste URL
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                  className="w-full text-xs p-2 border border-[#cccccc] rounded bg-[#fafafa] mb-2"
                />
                <input
                  type="text"
                  name="image_url_fallback"
                  placeholder="Or enter image URL (e.g. /slideshow/slide1.png)"
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Preview */}
              {newImagePreview && (
                <div className="h-32 bg-[#111111] rounded overflow-hidden relative">
                  <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                    Image Preview
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-[#cccccc] text-xs font-medium rounded hover:bg-[#eeeeee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded disabled:opacity-50"
                >
                  {isSubmitting ? "Uploading & Saving..." : "Add to Slideshow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SLIDE MODAL */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#dddddd]">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" /> Edit Hero Build Slide
              </h2>
              <button onClick={() => setEditingSlide(null)} className="text-[#888888] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSlide} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Slide Title *
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingSlide.title}
                  required
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Category Tag *
                </label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editingSlide.category}
                  required
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Short Description *
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingSlide.description}
                  required
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  YouTube Video Link
                </label>
                <input
                  type="url"
                  name="video_url"
                  value={editVideoUrl}
                  onChange={(e) => {
                    setEditVideoUrl(e.target.value);
                    if (!editImagePreview) {
                      const { thumbnailUrl } = parseYouTubeUrl(e.target.value);
                      if (thumbnailUrl) setEditImagePreview(thumbnailUrl);
                    }
                  }}
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Replace Slide Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="w-full text-xs p-2 border border-[#cccccc] rounded bg-[#fafafa]"
                />
              </div>

              {/* Preview */}
              {(editImagePreview || editingSlide.image_url) && (
                <div className="h-32 bg-[#111111] rounded overflow-hidden relative">
                  <img src={editImagePreview || editingSlide.image_url} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                    Current Image Preview
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 border border-[#cccccc] text-xs font-medium rounded hover:bg-[#eeeeee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded disabled:opacity-50"
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
