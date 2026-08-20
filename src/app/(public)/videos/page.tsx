import { createClient } from "@/lib/supabase/server";
import VideosClient from "./VideosClient";

export const metadata = {
  title: "Videos | Ideas by Suyash",
  description: "Watch hardware build logs, engineering video demos, and tutorials by Suyash Desai.",
};

export default async function VideosPage() {
  let videos: any[] = [];
  
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("social_posts")
      .select("*")
      .order("published_at", { ascending: false });
      
    if (data) videos = data;
  } catch (error) {
    console.error("Failed to fetch videos from Supabase:", error);
  }

  return (
    <div className="w-full bg-[#f8fafc] text-[#0f172a] font-sans min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        
        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-steel-blue text-xs font-bold tracking-wider uppercase font-mono">
            YOUTUBE • BUILD LOGS • DEMOS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight font-heading">
            Engineering Video Channel
          </h1>
          <p className="text-base text-cool-slate leading-relaxed max-w-2xl">
            Watch full build logs, live project demonstrations, circuit assembly walkthroughs, and tutorials. Click any video card to play directly.
          </p>
        </div>

        {/* Video Grid & Lightbox Component */}
        <VideosClient initialVideos={videos} />

      </div>
    </div>
  );
}
