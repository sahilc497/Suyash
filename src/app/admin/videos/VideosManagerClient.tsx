"use client";

import { useState, useEffect } from "react";
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
    : "/circuit-board-header.jpg";

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

  // Form states
  const [newUrl, setNewUrl] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("");
  
  const [editUrl, setEditUrl] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");

  // Load saved videos from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("buildpulse_videos_archive");
      if (stored) {
        setVideos(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveVideosToStore = (newVideos: VideoItem[]) => {
    setVideos(newVideos);
    try {
      localStorage.setItem("buildpulse_videos_archive", JSON.stringify(newVideos));
      window.dispatchEvent(new Event("videos_updated"));
    } catch (e) {
      console.error(e);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

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

  const handleCreateVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const url = formData.get("content_url") as string || "";
    const { defaultThumbnail } = extractYouTubeInfo(url);
    const thumbnail = newThumbnail || (formData.get("thumbnail_url") as string) || defaultThumbnail;

    const newVideo: VideoItem = {
      id: Date.now().toString(),
      title: formData.get("title") as string || "New Engineering Video",
      description: formData.get("description") as string || "",
      content_url: url,
      thumbnail_url: thumbnail,
      category: formData.get("category") as string || "Tutorial",
      platform: "youtube",
      published_at: new Date().toISOString(),
    };

    const updated = [newVideo, ...videos];
    saveVideosToStore(updated);
    setIsNewModalOpen(false);
    setNewUrl("");
    setNewThumbnail("");
  };

  const handleUpdateVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingVideo) return;

    const formData = new FormData(e.currentTarget);
    const url = formData.get("content_url") as string || editingVideo.content_url;
    const thumbnail = editThumbnail || (formData.get("thumbnail_url") as string) || editingVideo.thumbnail_url;

    const updatedVideo: VideoItem = {
      ...editingVideo,
      title: formData.get("title") as string || editingVideo.title,
      description: formData.get("description") as string || editingVideo.description,
      content_url: url,
      thumbnail_url: thumbnail,
      category: formData.get("category") as string || editingVideo.category || "Tutorial",
    };

    const updated = videos.map((v) => (v.id === editingVideo.id ? updatedVideo : v));
    saveVideosToStore(updated);
    setEditingVideo(null);
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm("Are you sure you want to remove this video from your channel archive?")) {
      const updated = videos.filter((v) => v.id !== id);
      saveVideosToStore(updated);
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
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white text-steel-blue flex items-center justify-center shadow-lg">
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-[#0f172a] leading-snug line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-xs text-cool-slate leading-relaxed line-clamp-2">
                  {video.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
              <a 
                href={video.content_url} 
                target="_blank" 
                className="text-xs font-semibold text-steel-blue hover:underline flex items-center gap-1"
              >
                Watch Video <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingVideo(video);
                    setEditUrl(video.content_url);
                    setEditThumbnail(video.thumbnail_url);
                  }}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Edit Video"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  title="Delete Video"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE NEW VIDEO MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-[#0f172a]">Add New Video</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVideo} className="space-y-4 text-xs font-medium text-[#0f172a]">
              <div>
                <label className="block font-bold mb-1">YouTube / Video URL or Embedded Link *</label>
                <input 
                  type="url"
                  name="content_url"
                  required
                  value={newUrl}
                  onChange={(e) => handleNewUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                />
                <p className="text-[10px] text-cool-slate mt-1">
                  Tip: Paste any YouTube link and the high-res thumbnail will auto-generate below!
                </p>
              </div>

              <div>
                <label className="block font-bold mb-1">Video Title *</label>
                <input 
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. ESP32 Handheld Game Console Build Log"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Short Description / Key Topics *</label>
                <textarea 
                  name="description"
                  required
                  rows={3}
                  placeholder="Brief summary of hardware features, sensors, and code..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Category Tag</label>
                  <select
                    name="category"
                    defaultValue="Embedded Systems"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                  >
                    <option value="Arduino & ESP32">Arduino & ESP32</option>
                    <option value="IoT">IoT</option>
                    <option value="Embedded Systems">Embedded Systems</option>
                    <option value="ECE">ECE</option>
                    <option value="Robotics & Automation">Robotics & Automation</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Thumbnail URL</label>
                  <input 
                    type="text"
                    name="thumbnail_url"
                    value={newThumbnail}
                    onChange={(e) => setNewThumbnail(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                  />
                </div>
              </div>

              {/* Thumbnail Preview */}
              {newThumbnail && (
                <div className="space-y-1">
                  <span className="block text-[11px] font-bold text-cool-slate">Thumbnail Preview:</span>
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img src={newThumbnail} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-steel-blue text-white font-bold hover:bg-blue-700 transition-all shadow-xs"
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VIDEO MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-[#0f172a]">Edit Video</h3>
              <button onClick={() => setEditingVideo(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVideo} className="space-y-4 text-xs font-medium text-[#0f172a]">
              <div>
                <label className="block font-bold mb-1">YouTube / Video URL *</label>
                <input 
                  type="url"
                  name="content_url"
                  required
                  value={editUrl}
                  onChange={(e) => handleEditUrlChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Video Title *</label>
                <input 
                  type="text"
                  name="title"
                  required
                  defaultValue={editingVideo.title}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description / Key Topics *</label>
                <textarea 
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingVideo.description}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Category Tag</label>
                  <select
                    name="category"
                    defaultValue={editingVideo.category || "Tutorial"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                  >
                    <option value="Arduino & ESP32">Arduino & ESP32</option>
                    <option value="IoT">IoT</option>
                    <option value="Embedded Systems">Embedded Systems</option>
                    <option value="ECE">ECE</option>
                    <option value="Robotics & Automation">Robotics & Automation</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Thumbnail URL</label>
                  <input 
                    type="text"
                    name="thumbnail_url"
                    value={editThumbnail}
                    onChange={(e) => setEditThumbnail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-steel-blue"
                  />
                </div>
              </div>

              {/* Thumbnail Preview */}
              {editThumbnail && (
                <div className="space-y-1">
                  <span className="block text-[11px] font-bold text-cool-slate">Thumbnail Preview:</span>
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img src={editThumbnail} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-steel-blue text-white font-bold hover:bg-blue-700 transition-all shadow-xs"
                >
                  Update Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
