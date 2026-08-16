import Link from "next/link";
import { Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Videos | BuildPulse",
  description: "Hardware build logs and engineering videos from YouTube.",
};

export default async function VideosPage() {
  let videos: any[] = [];
  
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("social_posts")
      .select("*")
      .eq("platform", "youtube")
      .order("published_at", { ascending: false });
      
    if (data) videos = data;
  } catch (error) {
    console.error("Failed to fetch videos:", error);
  }

  return (
    <div className="w-full bg-[#fcfcfc] text-[#333333] min-h-screen py-12">
      <div className="max-w-[1100px] mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#111111] mb-2">Videos</h1>
        <p className="text-[17px] text-[#555555] mb-12 max-w-2xl">
          Complete archive of all YouTube build logs, tutorials, and deep-dives.
        </p>

        {videos.length === 0 ? (
          <div className="p-8 border border-dashed border-[#cccccc] bg-[#f9f9f9] text-center text-[#777777]">
            <p>No videos synced yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="group">
                <Link href={video.content_url || "#"} target="_blank" className="block w-full aspect-video bg-[#eeeeee] border border-[#dddddd] mb-3 flex items-center justify-center hover:bg-[#e4e4e4] transition-colors relative overflow-hidden">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Play className="h-8 w-8 text-[#999999]" />
                  )}
                </Link>
                <h3 className="text-[17px] font-medium text-[#111111] leading-snug mb-1">
                  <Link href={video.content_url || "#"} target="_blank" className="hover:text-blue-600">
                    {video.title}
                  </Link>
                </h3>
                <p className="text-[13px] text-[#666666] font-mono">
                  {new Date(video.published_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
