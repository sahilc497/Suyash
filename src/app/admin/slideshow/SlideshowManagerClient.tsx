"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Video, Image as ImageIcon, Save, Check, X, ExternalLink, Upload, Film } from "lucide-react";

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

  // File upload state for new slide
  const [newImagePreview, setNewImagePreview] = useState<string>("/slideshow/slide1.png");
  const [editImagePreview, setEditImagePreview] = useState<string>("");

  // Load saved slides from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("buildpulse_slideshow_slides");
      if (stored) {
        setSlides(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveSlides = (newSlides: SlideItem[]) => {
    setSlides(newSlides);
    try {
      localStorage.setItem("buildpulse_slideshow_slides", JSON.stringify(newSlides));
      window.dispatchEvent(new Event("slideshow_updated"));
    } catch (e) {
      console.error(e);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Convert uploaded image file to Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleCreateSlide = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const finalImageUrl = newImagePreview || (formData.get("image_url_fallback") as string) || "/slideshow/slide1.png";

    const newSlide: SlideItem = {
      id: Date.now().toString(),
      title: formData.get("title") as string || "New Build Slide",
      description: formData.get("description") as string || "",
      category: formData.get("category") as string || "EMBEDDED HARDWARE",
      image_url: finalImageUrl,
      video_url: formData.get("video_url") as string || "",
      display_order: slides.length + 1,
      is_active: true,
    };

    const updated = [...slides, newSlide];
    saveSlides(updated);
    setIsNewModalOpen(false);
    setNewImagePreview("/slideshow/slide1.png");
  };

  const handleUpdateSlide = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSlide) return;

    const formData = new FormData(e.currentTarget);
    const finalImageUrl = editImagePreview || editingSlide.image_url;

    const updatedSlide: SlideItem = {
      ...editingSlide,
      title: formData.get("title") as string || editingSlide.title,
      description: formData.get("description") as string || editingSlide.description,
      category: formData.get("category") as string || editingSlide.category,
      image_url: finalImageUrl,
      video_url: formData.get("video_url") as string || editingSlide.video_url,
    };

    const updated = slides.map(s => s.id === editingSlide.id ? updatedSlide : s);
    saveSlides(updated);
    setEditingSlide(null);
    setEditImagePreview("");
  };

  const handleDeleteSlide = (id: string) => {
    if (confirm("Are you sure you want to remove this slide from the hero slideshow?")) {
      const updated = slides.filter(s => s.id !== id);
      saveSlides(updated);
    }
  };

  const toggleActive = (id: string) => {
    const updated = slides.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s);
    saveSlides(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Alert banner for save status */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm flex items-center gap-2 font-medium">
          <Check className="h-5 w-5 text-emerald-600" /> Hero Slideshow updated successfully!
        </div>
      )}

      {/* Header bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#dddddd] shadow-xs">
        <p className="text-sm font-medium text-[#555555]">
          Active Slides: <span className="font-bold text-[#111111]">{slides.filter(s => s.is_active).length} / {slides.length}</span>
        </p>
        <button
          onClick={() => {
            setNewImagePreview("/slideshow/slide1.png");
            setIsNewModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Upload New Build Photo
        </button>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white border border-[#dddddd] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              {/* Image Preview */}
              <div className="relative aspect-video bg-slate-900 border-b border-[#eeeeee] overflow-hidden">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-mono font-bold rounded-full uppercase tracking-wider shadow-sm">
                  {slide.category}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 text-white text-xs font-mono rounded-full">
                  Slide {index + 1}
                </span>
              </div>

              {/* Slide Info */}
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg text-[#111111] leading-snug">{slide.title}</h3>
                <p className="text-sm text-[#666666] line-clamp-2">{slide.description}</p>
                
                {slide.video_url && (
                  <a
                    href={slide.video_url}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 font-semibold hover:underline pt-1"
                  >
                    <Film className="h-3.5 w-3.5" /> Video Link Attached <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Slide Action Buttons */}
            <div className="p-4 bg-[#f8f9fa] border-t border-[#eeeeee] flex items-center justify-between gap-2">
              <button
                onClick={() => toggleActive(slide.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  slide.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                }`}
              >
                {slide.is_active ? "✓ Active on Hero" : "Hidden"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingSlide(slide);
                    setEditImagePreview(slide.image_url);
                  }}
                  className="p-2 text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-[#dddddd] cursor-pointer"
                  title="Edit Slide"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteSlide(slide.id)}
                  className="p-2 text-slate-700 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-[#dddddd] cursor-pointer"
                  title="Delete Slide"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Upload New Slide & Image */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#dddddd] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-xl font-bold text-[#111111]">Upload New Build Slide</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlide} className="space-y-4">
              {/* Direct File Picker */}
              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">
                  Upload Image File from Device
                </label>
                <div className="border-2 border-dashed border-blue-400/60 rounded-xl p-4 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, false)}
                    className="hidden"
                    id="new-image-file-input"
                  />
                  <label htmlFor="new-image-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">Choose Image File (JPG, PNG, WEBP)</span>
                    <span className="text-xs text-slate-500">Click to select photo from computer</span>
                  </label>
                </div>
              </div>

              {/* Uploaded Image Live Preview */}
              {newImagePreview && (
                <div>
                  <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Selected Image Preview</label>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-[#dddddd]">
                    <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Project / Slide Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Autonomous Mobile Rover"
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Category Tag</label>
                <input
                  name="category"
                  type="text"
                  required
                  placeholder="e.g. ROBOTICS & EDGE AI"
                  defaultValue="EMBEDDED HARDWARE"
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  placeholder="Describe key specs, microcontrollers, or features..."
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">YouTube or Instagram Video Link (Optional)</label>
                <input
                  name="video_url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or Instagram Reel Link"
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-[#cccccc] rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg"
                >
                  Upload & Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Slide & Replace Image */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#dddddd] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-xl font-bold text-[#111111]">Edit Build Slide & Photo</h2>
              <button onClick={() => setEditingSlide(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSlide} className="space-y-4">
              {/* Replace Image File Input */}
              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">
                  Replace Image File
                </label>
                <div className="border-2 border-dashed border-blue-400/60 rounded-xl p-3 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, true)}
                    className="hidden"
                    id="edit-image-file-input"
                  />
                  <label htmlFor="edit-image-file-input" className="cursor-pointer flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm">
                    <Upload className="h-4 w-4" /> Click to Select Replacement Image
                  </label>
                </div>
              </div>

              {/* Current / New Image Preview */}
              {(editImagePreview || editingSlide.image_url) && (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-[#dddddd]">
                  <img src={editImagePreview || editingSlide.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Slide Title</label>
                <input
                  name="title"
                  type="text"
                  defaultValue={editingSlide.title}
                  required
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Category Tag</label>
                <input
                  name="category"
                  type="text"
                  defaultValue={editingSlide.category}
                  required
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingSlide.description}
                  required
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">YouTube or Instagram Video Link</label>
                <input
                  name="video_url"
                  type="url"
                  defaultValue={editingSlide.video_url}
                  placeholder="https://www.youtube.com/watch?v=... or Instagram Reel URL"
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 border border-[#cccccc] rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

