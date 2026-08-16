import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Projects | BuildPulse",
  description: "Archive of hardware builds, robotics, and embedded systems projects.",
};

export default async function ProjectsPage() {
  let projects: any[] = [];
  
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
      
    if (data) projects = data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }

  return (
    <div className="w-full bg-[#fcfcfc] text-[#333333] min-h-screen py-12">
      <div className="max-w-[1100px] mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#111111] mb-2">Project Archive</h1>
        <p className="text-[17px] text-[#555555] mb-12 max-w-2xl">
          A complete log of all my hardware and software builds. Click on any project to read the detailed build logs, schematics, and source code.
        </p>

        {projects.length === 0 ? (
          <div className="p-8 border border-dashed border-[#cccccc] bg-[#f9f9f9] text-center text-[#777777]">
            <p>No projects published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="border border-[#dddddd] bg-white group">
                <Link href={`/projects/${project.slug}`} className="block w-full aspect-video bg-[#eeeeee] border-b border-[#dddddd] flex items-center justify-center relative overflow-hidden group-hover:opacity-90 transition-opacity">
                  {/* Image placeholder */}
                  <span className="font-mono text-sm text-[#888888] uppercase tracking-wide">Image</span>
                </Link>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#111111] mb-2 leading-tight">
                    <Link href={`/projects/${project.slug}`} className="hover:text-blue-600">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="text-[14px] text-[#555555] leading-relaxed mb-4 line-clamp-3">
                    {project.short_description}
                  </p>
                  <div className="flex items-center gap-3 text-[12px] text-[#777777] font-mono border-t border-[#eeeeee] pt-4 mt-auto">
                    <span>Status: {project.status || 'In Progress'}</span>
                    <span>•</span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
