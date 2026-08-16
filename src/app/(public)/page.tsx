import Link from "next/link";
import { Play, Code2, Cpu } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.6 5.9 3.5 5 4.7 4.8 8.1 4.3 15.9 4.3 19.3 4.8 20.5 5 21.4 5.9 21.5 7.1 21.8 9.3 21.8 14.7 21.5 16.9 21.4 18.1 20.5 19 19.3 19.2 15.9 19.7 8.1 19.7 4.7 19.2 3.5 19 2.6 18.1 2.5 16.9 2.2 14.7 2.2 9.3 2.5 7.1z"/><path d="m10 15 5-3-5-3z"/></svg>
);

export default async function Home() {
  // Gracefully handle missing env vars or DB connection errors
  let projects: any[] = [];
  let videos: any[] = [];
  
  try {
    const supabase = await createClient();
    
    const { data: fetchedProjects } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5);
      
    if (fetchedProjects) projects = fetchedProjects;

    const { data: fetchedVideos } = await supabase
      .from("social_posts")
      .select("*")
      .eq("platform", "youtube")
      .order("published_at", { ascending: false })
      .limit(3);
      
    if (fetchedVideos) videos = fetchedVideos;
  } catch (error) {
    console.error("Failed to fetch data from Supabase:", error);
  }

  return (
    <div className="w-full bg-[#fcfcfc] text-[#333333]">
      
      {/* Header Profile Section */}
      <section className="w-full border-b border-[#eeeeee] bg-white pt-12 pb-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Profile Image Placeholder */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-[#eeeeee] border border-[#dddddd] flex-shrink-0 flex items-center justify-center text-[#aaaaaa] overflow-hidden">
              <img src="/profile.png" alt="Suyash Desai" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-4xl font-normal text-[#111111]">
                Suyash Desai
              </h1>
              <p className="text-[17px] leading-relaxed text-[#444444] max-w-3xl">
                I build technology in the real world. My work explores the intersection of hardware and software—from embedded systems and autonomous robotics to AI-powered edge computing devices. I document my builds here to share what I learn along the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full py-12">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Main Column - Latest Projects/Tutorials */}
          <div className="md:col-span-2 space-y-12">
            <h2 className="text-xl font-bold text-[#222222] border-b-2 border-[#111111] pb-2 mb-6">
              Latest Projects & Build Logs
            </h2>

            {projects.length === 0 ? (
              <div className="p-8 border border-dashed border-[#cccccc] bg-[#f9f9f9] text-center text-[#777777]">
                <p>No projects published yet.</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="group">
                  <Link href={`/projects/${project.slug}`} className="block w-full bg-[#eeeeee] aspect-video border border-[#dddddd] mb-4 hover:opacity-90 transition-opacity flex items-center justify-center relative overflow-hidden">
                     {/* Replace with project_media later */}
                     <div className="text-center text-[#888888]">
                       <Cpu className="h-12 w-12 mx-auto mb-2" />
                       <span className="font-mono text-sm uppercase tracking-wide">Project Schematic</span>
                     </div>
                  </Link>
                  <h3 className="text-[22px] font-semibold text-[#111111] mb-2 leading-tight">
                    <Link href={`/projects/${project.slug}`} className="hover:text-blue-600">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="text-[15px] text-[#555555] leading-relaxed mb-3">
                    {project.short_description}
                  </p>
                  <div className="flex items-center gap-4 text-[13px] text-[#777777] font-mono">
                    <span>Status: {project.status || 'In Progress'}</span>
                    <span>•</span>
                    <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-12">
            
            {/* Latest Videos */}
            <div>
              <h2 className="text-xl font-bold text-[#222222] border-b-2 border-[#111111] pb-2 mb-6 flex items-center gap-2">
                <YoutubeIcon className="h-5 w-5 text-[#cc0000]" /> Recent Videos
              </h2>
              
              {videos.length === 0 ? (
                <div className="p-6 border border-dashed border-[#cccccc] bg-[#f9f9f9] text-center text-[#777777]">
                  <p className="text-sm">No videos synced yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {videos.map((video) => (
                    <div key={video.id} className="group">
                      <Link href={video.content_url || "#"} target="_blank" className="block w-full aspect-video bg-[#eeeeee] border border-[#dddddd] mb-3 flex items-center justify-center hover:bg-[#e4e4e4] transition-colors relative overflow-hidden">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <Play className="h-8 w-8 text-[#999999]" />
                        )}
                      </Link>
                      <h4 className="text-[15px] font-medium text-[#111111] leading-snug hover:text-blue-600 line-clamp-2">
                        <Link href={video.content_url || "#"} target="_blank">{video.title}</Link>
                      </h4>
                      <p className="text-[13px] text-[#666666] mt-1">
                        {new Date(video.published_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resources / Links */}
            <div>
              <h2 className="text-xl font-bold text-[#222222] border-b-2 border-[#111111] pb-2 mb-6">
                Resources
              </h2>
              <ul className="space-y-3 text-[15px]">
                <li>
                  <Link href="/hardware" className="text-blue-600 hover:underline">
                    Recommended Hardware & Tools
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/ideasbysuyash" className="text-blue-600 hover:underline" target="_blank">
                    GitHub Repositories
                  </Link>
                </li>
                <li>
                  <Link href="/work-with-me" className="text-blue-600 hover:underline">
                    Sponsorships & Collaborations
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
