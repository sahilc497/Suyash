"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Video, Image as ImageIcon, Save, Check, X, ExternalLink, Play, Sparkles } from "lucide-react";

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  content_url: string;
  thumbnail_url: string;
  category?: string;
  platform?: string;
  published_at?: string;
}

// Utility to extract YouTube Video ID & default thumbnail
function extractYouTubeInfo(url: string) {
  let videoId = "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    videoId = match[2];
  }

  const defaultThumbnail = videoId 
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
    : "/circuit-schematic.jpg";

  const embedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1` 
    : url;

  return { videoId, defaultThumbnail, embedUrl };
}

export default function VideosManagerClient({ initialVideos }: { initialVideos: VideoItem[] }) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newUrl, setNewUrl] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("");
  
  const [editUrl, setEditUrl] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");

  // Sync videos from Supabase DB on mount
  useEffect(() => {
    const syncVideosFromSupabase = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("social_posts")
          .select("*")
          .order("published_at", { ascending: false });

        if (data && data.length > 0) {
          setVideos(data as VideoItem[]);
        }
      } catch (e) {
        console.error("Failed to sync videos from Supabase:", e);
      }
    };

    syncVideosFromSupabase();
  }, []);

  // Auto populate thumbnail when video URL changes
  const handleNewUrlChange = (url: string) => {
    setNewUrl(url);
    const { defaultThumbnail } = extractYouTubeInfo(url);
    setNewThumbnail(defaultThumbnail);
  };

  const handleEditUrlChange = (url: string) => {
    setEditUrl(url);
    const { defaultThumbnail } = extractYouTubeInfo(url);
    setEditThumbnail(defaultThumbnail);
  };

  // Create Video in Supabase DB
  const handleCreateVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const url = formData.get("content_url") as string || "";
    const { defaultThumbnail } = extractYouTubeInfo(url);
    const thumbnail = newThumbnail || (formData.get("thumbnail_url") as string) || defaultThumbnail;
    const title = formData.get("title") as string || "New Engineering Video";
    const description = formData.get("description") as string || "";
    const category = formData.get("category") as string || "Tutorial";

    const supabase = createClient();
    const { data, error } = await supabase
      .from("social_posts")
      .insert({
        title,
        description,
        content_url: url,
        thumbnail_url: thumbnail,
        category,
        platform: "youtube",
        content_type: "video",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating video in Supabase:", error);
      // Fallback local addition if DB fails
      const fallbackVideo: VideoItem = {
        id: Date.now().toString(),
        title,
        description,
        content_url: url,
        thumbnail_url: thumbnail,
        category,
        platform: "youtube",
        published_at: new Date().toISOString(),
      };
      setVideos([fallbackVideo, ...videos]);
    } else if (data) {
      setVideos([data as VideoItem, ...videos]);
    }

    // Save backup to localStorage
    try {
      localStorage.setItem("buildpulse_videos_archive", JSON.stringify(videos));
      window.dispatchEvent(new Event("videos_updated"));
    } catch (err) {
      console.error(err);
    }

    setIsSubmitting(false);
    setIsNewModalOpen(false);
    setNewUrl("");
    setNewThumbnail("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Update Video in Supabase DB
  const handleUpdateVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingVideo) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const url = formData.get("content_url") as string || editingVideo.content_url;
    const thumbnail = editThumbnail || (formData.get("thumbnail_url") as string) || editingVideo.thumbnail_url;
    const title = formData.get("title") as string || editingVideo.title;
    const description = formData.get("description") as string || editingVideo.description;
    const category = formData.get("category") as string || editingVideo.category || "Tutorial";

    const supabase = createClient();
    const { error } = await supabase
      .from("social_posts")
      .update({
        title,
        description,
        content_url: url,
        thumbnail_url: thumbnail,
        category,
      })
      .eq("id", editingVideo.id);

    if (error) {
      console.error("Error updating video in Supabase:", error);
    }

    const updatedVideo: VideoItem = {
      ...editingVideo,
      title,
      description,
      content_url: url,
      thumbnail_url: thumbnail,
      category,
    };

    const updatedList = videos.map((v) => (v.id === editingVideo.id ? updatedVideo : v));
    setVideos(updatedList);

    try {
      localStorage.setItem("buildpulse_videos_archive", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("videos_updated"));
    } catch (err) {
      console.error(err);
    }

    setIsSubmitting(false);
    setEditingVideo(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Delete Video from Supabase DB
  const handleDeleteVideo = async (id: string) => {
    if (confirm("Are you sure you want to remove this video from your channel archive?")) {
      const supabase = createClient();
      await supabase.from("social_posts").delete().eq("id", id);

      const updatedList = videos.filter((v) => v.id !== id);
      setVideos(updatedList);

      try {
        localStorage.setItem("buildpulse_videos_archive", JSON.stringify(updatedList));
        window.dispatchEvent(new Event("videos_updated"));
      } catch (err) {
        console.error(err);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs">
          <Check className="h-5 w-5 text-emerald-600" /> Video archive updated successfully!
        </div>
      )}

      {/* Header Bar & Add Video Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a]">Video Archive Manager</h2>
          <p className="text-xs text-cool-slate mt-1">
            Add YouTube video URLs or embedded links along with custom thumbnails, titles, and topics.
          </p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-steel-blue hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs shadow-steel-blue/20"
        >
          <Plus className="h-4 w-4" /> Add New Video
        </button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between group">
            <div>
              <div className="w-full aspect-video bg-slate-900 overflow-hidden relative block">
                <img 
                  src={video.thumbnail_url || "/circuit-board-header.jpg"} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-steel-blue text-white text-[11px] font-bold">
                  {video.category || "YouTube"}
                </span>
              </div>
              
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-[#0f172a] leading-snug group-hover:text-steel-blue transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-cool-slate leading-relaxed line-clamp-2">
                  {video.description || "Video build log demonstration."}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <a 
                href={video.content_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-semibold text-steel-blue hover:underline flex items-center gap-1"
              >
                Open Link <ExternalLink className="h-3 w-3" />
              </a>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingVideo(video);
                    setEditUrl(video.content_url);
                    setEditThumbnail(video.thumbnail_url);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Edit Video"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Video"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW VIDEO MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                <Video className="h-5 w-5 text-steel-blue" /> Add YouTube Video
              </h3>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  YouTube Link or Embedded URL *
                </label>
                <input
                  type="url"
                  name="content_url"
                  value={newUrl}
                  onChange={(e) => handleNewUrlChange(e.target.value)}
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-steel-blue"
                />
                <p className="text-[10px] text-cool-slate mt-1">
                  Supports YouTube watch links, shorts (`shorts/`), `youtu.be/`, and embed links. High-res thumbnail auto-generates!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. ESP32 Handheld Gaming Console Build Log"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-steel-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  Category / Topic Tag
                </label>
                <select
                  name="category"
                  defaultValue="Tutorial"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-steel-blue"
                >
                  <option value="Tutorial">Tutorial</option>
                  <option value="Robotics & Automation">Robotics & Automation</option>
                  <option value="Arduino & ESP32">Arduino & ESP32</option>
                  <option value="Embedded Systems">Embedded Systems</option>
                  <option value="IoT & Wireless">IoT & Wireless</option>
                  <option value="ECE & Circuits">ECE & Circuits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief summary of the build video demonstration..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-steel-blue"
                />
              </div>

              {/* Preview Thumbnail */}
              {newThumbnail && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-cool-slate">
                    Auto-Generated YouTube Thumbnail Preview:
                  </label>
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img src={newThumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-steel-blue hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Publishing..." : "Publish Video Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VIDEO MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-steel-blue" /> Edit Video Archive
              </h3>
              <button 
                onClick={() => setEditingVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  YouTube Link or Embedded URL
                </label>
                <input
                  type="url"
                  name="content_url"
                  value={editUrl}
                  onChange={(e) => handleEditUrlChange(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-steel-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingVideo.title}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-steel-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  Category / Topic Tag
                </label>
                <select
                  name="category"
                  defaultValue={editingVideo.category || "Tutorial"}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-steel-blue"
                >
                  <option value="Tutorial">Tutorial</option>
                  <option value="Robotics & Automation">Robotics & Automation</option>
                  <option value="Arduino & ESP32">Arduino & ESP32</option>
                  <option value="Embedded Systems">Embedded Systems</option>
                  <option value="IoT & Wireless">IoT & Wireless</option>
                  <option value="ECE & Circuits">ECE & Circuits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingVideo.description}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-steel-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-steel-blue hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
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
