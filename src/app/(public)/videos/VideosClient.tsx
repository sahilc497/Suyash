"use client";

import { Play, ExternalLink } from "lucide-react";
import { VideoItem } from "@/app/admin/videos/VideosManagerClient";

export default function VideosClient({ initialVideos }: { initialVideos: VideoItem[] }) {
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
              <a 
                href={video.content_url}
                target="_blank"
                rel="noreferrer"
                className="w-full aspect-video bg-slate-900 overflow-hidden relative block cursor-pointer"
              >
                <img 
                  src={video.thumbnail_url || "/circuit-schematic.jpg"} 
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
              </a>
              
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-[#0f172a] leading-snug hover:text-steel-blue transition-colors">
                  <a 
                    href={video.content_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {video.title}
                  </a>
                </h3>
                <p className="text-xs text-cool-slate leading-relaxed line-clamp-3">
                  {video.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
              <a 
                href={video.content_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-steel-blue hover:underline flex items-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Watch on YouTube
              </a>
              
              <a 
                href={video.content_url} 
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-cool-slate hover:text-[#0f172a] flex items-center gap-1"
              >
                YouTube <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
