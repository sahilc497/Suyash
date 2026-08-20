"use client";

import { useState } from "react";
import Link from "next/link";
import { Cpu, ArrowRight, Layers, Sparkles } from "lucide-react";

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  category?: string;
  difficulty?: string;
  status?: string;
  progress?: number;
  image_url?: string;
  tags?: string[];
  created_at: string;
}

const CATEGORIES = [
  "All",
  "Arduino & ESP32",
  "IoT",
  "Embedded Systems",
  "ECE",
  "Robotics & Automation",
];

export default function ProjectsClient({ initialProjects }: { initialProjects: ProjectItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredProjects = selectedCategory === "All" 
    ? initialProjects 
    : initialProjects.filter((project) => {
        const cat = project.category?.toLowerCase() || "";
        const target = selectedCategory.toLowerCase();
        
        // Flexible matching for variations (e.g. Arduino & ESP32 vs ESP32)
        if (target.includes("arduino") || target.includes("esp32")) {
          return cat.includes("arduino") || cat.includes("esp") || target === cat;
        }
        if (target.includes("robotics")) {
          return cat.includes("robot") || cat.includes("automation") || target === cat;
        }
        if (target.includes("embedded")) {
          return cat.includes("embed") || target === cat;
        }
        if (target.includes("iot")) {
          return cat.includes("iot") || cat.includes("cloud") || target === cat;
        }
        if (target.includes("ece")) {
          return cat.includes("ece") || cat.includes("electronics") || cat.includes("circuit") || target === cat;
        }
        return cat === target;
      });

  return (
    <div className="space-y-8">
      
      {/* Category Filter Tabs Bar (Horizontally swipeable on mobile screens) */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 overflow-x-auto scrollbar-none flex-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? "bg-steel-blue text-white shadow-sm shadow-steel-blue/25 scale-[1.02]"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {cat === "All" && <Sparkles className="h-3.5 w-3.5" />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-steel-blue flex items-center justify-center mx-auto">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a]">No projects found in "{selectedCategory}"</h3>
          <p className="text-xs text-cool-slate max-w-md mx-auto">
            No builds have been published under this category yet. Check back soon or select "All" to view the complete build log archive.
          </p>
          <button 
            onClick={() => setSelectedCategory("All")}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-[#0f172a] text-white hover:bg-navy-slate transition-all inline-block mt-2"
          >
            View All Projects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <Link href={`/projects/${project.slug}`} className="w-full aspect-video bg-slate-900 overflow-hidden block relative">
                  <img 
                    src={project.image_url || "/circuit-schematic.jpg"} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-steel-blue text-white text-[11px] font-bold tracking-wide shadow-xs">
                    {project.category || "Arduino & ESP32"}
                  </span>
                </Link>
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-[#0f172a] leading-snug group-hover:text-steel-blue transition-colors">
                    <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                  </h3>
                  <p className="text-xs text-cool-slate leading-relaxed line-clamp-3">
                    {project.short_description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {(project.tags || ["ESP32", "Hardware"]).map((tag: string) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[#475569] text-[10px] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-cool-slate pt-3 border-t border-slate-100 font-medium">
                  <span>Status: <strong className="text-[#0f172a]">{project.status || 'Completed'}</strong></span>
                  <Link href={`/projects/${project.slug}`} className="text-steel-blue font-bold hover:underline flex items-center gap-1">
                    Read Log <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
