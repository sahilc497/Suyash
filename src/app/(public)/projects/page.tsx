import { createClient } from "@/lib/supabase/server";
import ProjectsClient from "./ProjectsClient";

export const metadata = {
  title: "Projects | Ideas by Suyash",
  description: "Explore engineering build logs, hardware schematics, IoT systems, robotics, and embedded projects by Suyash Desai.",
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
    <div className="w-full bg-[#f8fafc] text-[#0f172a] font-sans min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        
        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-steel-blue text-xs font-bold tracking-wider uppercase font-mono">
            HARDWARE • ROBOTICS • IOT
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight font-heading">
            Project Archive
          </h1>
          <p className="text-base text-cool-slate leading-relaxed max-w-2xl">
            Filter through hardware builds, embedded firmware, IoT systems, robotics, and ECE circuits. Click any project to inspect full build logs and schematics.
          </p>
        </div>

        {/* Client Side Filterable Projects Grid */}
        <ProjectsClient initialProjects={projects} />

      </div>
    </div>
  );
}
