"use client";

import { useState } from "react";
import { Play, ExternalLink, X, Film, Sparkles } from "lucide-react";
import { VideoItem } from "@/app/admin/videos/VideosManagerClient";

function getEmbedUrl(url: string) {
  let videoId = "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  return url;
}

export default function VideosClient({ initialVideos }: { initialVideos: VideoItem[] }) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <div className="space-y-8">
      
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialVideos.map((video) => (
          <div 
            key={video.id} 
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div 
                onClick={() => setActiveVideo(video)}
                className="w-full aspect-video bg-slate-900 overflow-hidden relative block cursor-pointer"
              >
                <img 
                  src={video.thumbnail_url || "/circuit-board-header.jpg"} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-steel-blue text-white text-[11px] font-bold tracking-wide shadow-xs">
                  {video.category || "YouTube"}
                </span>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/50 flex items-center justify-center transition-all">
                  <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-xs text-steel-blue flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-7 w-7 fill-current ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="p-5 space-y-2">
                <h3 
                  onClick={() => setActiveVideo(video)}
                  className="text-base font-bold text-[#0f172a] leading-snug hover:text-steel-blue transition-colors cursor-pointer"
                >
                  {video.title}
                </h3>
                <p className="text-xs text-cool-slate leading-relaxed line-clamp-3">
                  {video.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
              <button 
                onClick={() => setActiveVideo(video)}
                className="text-xs font-bold text-steel-blue hover:underline flex items-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Watch Video
              </button>
              
              <a 
                href={video.content_url} 
                target="_blank"
                className="text-xs font-medium text-cool-slate hover:text-[#0f172a] flex items-center gap-1"
              >
                YouTube <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX EMBEDDED VIDEO MODAL PLAYER */}
      {activeVideo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden max-w-4xl w-full border border-white/10 shadow-2xl space-y-4">
            
            {/* Modal Top Bar */}
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-steel-blue text-xs font-bold">
                  {activeVideo.category || "YouTube"}
                </span>
                <h3 className="text-sm font-bold truncate max-w-md">{activeVideo.title}</h3>
              </div>
              <button 
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Embed Video Player Container */}
            <div className="w-full aspect-video bg-black">
              <iframe
                src={getEmbedUrl(activeVideo.content_url)}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Bottom Caption */}
            <div className="p-4 sm:p-6 bg-slate-950 text-slate-300 space-y-2">
              <h4 className="text-base font-bold text-white">{activeVideo.title}</h4>
              <p className="text-xs leading-relaxed text-slate-400 max-w-2xl">{activeVideo.description}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
