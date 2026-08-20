import { createClient } from "@/lib/supabase/server";
import VideosManagerClient from "./VideosManagerClient";

export default async function AdminVideosPage() {
  let videos: any[] = [];
  
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("social_posts")
      .select("*")
      .order("published_at", { ascending: false });
      
    if (data) videos = data;
  } catch (err) {
    console.error("Failed to load videos from Supabase:", err);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] font-heading">Videos & Channel Manager</h1>
          <p className="text-cool-slate text-sm mt-1">
            Easily add YouTube video links, embedded video players, custom thumbnails, and project topics.
          </p>
        </div>
      </div>

      <VideosManagerClient initialVideos={videos} />
    </div>
  );
}
