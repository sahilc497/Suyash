import Link from "next/link";
import { 
  Play, Cpu, ArrowRight, ChevronRight, Eye, 
  Code2, Cloud, Wrench, FileText, Layers, Video, Plus, Sparkles, FolderOpen, Download
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import HeroSlideshow from "@/components/HeroSlideshow";
import { parseYouTubeUrl } from "@/lib/youtube";

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.6 5.9 3.5 5 4.7 4.8 8.1 4.3 15.9 4.3 19.3 4.8 20.5 5 21.4 5.9 21.5 7.1 21.8 9.3 21.8 14.7 21.5 16.9 21.4 18.1 20.5 19 19.3 19.2 15.9 19.7 8.1 19.7 4.7 19.2 3.5 19 2.6 18.1 2.5 16.9 2.2 14.7 2.2 9.3 2.5 7.1z"/><path d="m10 15 5-3-5-3z"/></svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

export default async function Home() {
  let projects: any[] = [];
  let videos: any[] = [];
  let articles: any[] = [];
  let resources: any[] = [];
  
  try {
    const supabase = await createClient();
    
    // Fetch published projects
    const { data: fetchedProjects } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(4);
      
    if (fetchedProjects) projects = fetchedProjects;

    // Fetch videos from social_posts table
    const { data: fetchedVideos } = await supabase
      .from("social_posts")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(4);

    if (fetchedVideos) videos = fetchedVideos;

    // Fetch articles
    const { data: fetchedArticles } = await supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(4);

    if (fetchedArticles) articles = fetchedArticles;

    // Fetch published resources
    const { data: fetchedResources } = await supabase
      .from("resources")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(4);

    if (fetchedResources) resources = fetchedResources;

  } catch (error) {
    console.error("Failed to fetch data from Supabase:", error);
  }

  const defaultResources = [
    {
      id: "res-1",
      title: "ESP32 Pinout Cheat Sheet & Hardware Reference",
      cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      detail_text: "Comprehensive pin mapping, ADC attenuation guide, and GPIO pull-up/pull-down restrictions for ESP32-WROOM-32 and ESP32-S3 boards.",
      category: "Cheat Sheet",
      download_url: "https://github.com/astrix884",
      slug: "esp32-pinout-cheat-sheet",
    },
    {
      id: "res-2",
      title: "KiCad 8 Custom Component Library for Robotics",
      cover_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      detail_text: "Curated 3D footprints and schematic symbols for popular motor drivers, IMUs, buck converters, and lithium charging modules.",
      category: "CAD & PCB",
      download_url: "https://github.com/astrix884",
      slug: "kicad-8-custom-component-library",
    },
    {
      id: "res-3",
      title: "Embedded C++ System Architecture Guide",
      cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      detail_text: "Architectural blueprint for real-time sensor processing loops, FreeRTOS task scheduling, zero-copy buffer allocations, and state machines.",
      category: "Guide & Code",
      download_url: "https://github.com/astrix884",
      slug: "embedded-cpp-system-architecture",
    },
    {
      id: "res-4",
      title: "LiPo Battery Management & Protection Circuit Schematic",
      cover_image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=800&q=80",
      detail_text: "Reference schematic for 1S/2S LiPo charging using TP4056 and DW01 protection ICs with load sharing circuitry.",
      category: "Schematics",
      download_url: "https://github.com/astrix884",
      slug: "lipo-battery-management-schematic",
    },
  ];

  const displayResources = resources.length > 0 ? resources : defaultResources;

  return (
    <div className="w-full bg-[#f8fafc] text-[#0f172a] font-sans min-h-screen flex flex-col">
      
      {/* 1. HERO SECTION (Left Column: About Profile Card | Right Column: Hero Slideshow) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Left Column: About Suyash Profile Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-full space-y-4">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 border border-slate-200 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                <img src="/profile.png" alt="Suyash Desai" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-steel-blue animate-pulse" />
                  <span className="font-mono text-[11px] text-steel-blue tracking-wider uppercase font-bold">E&TC STUDENT • BUILDER • CREATOR</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight font-heading">
                  Suyash Desai
                </h1>
                
                <p className="text-xs sm:text-sm leading-relaxed text-cool-slate">
                  Hi, I'm Suyash!! An Electronics & Telecommunication engineering student and a hobbyist who enjoys building things with electronics, robotics, and technology.
                </p>
                
                <div className="pt-1 flex flex-wrap items-center gap-2.5">
                  <a href="#featured-projects" className="text-xs font-bold px-4 py-2 rounded-full bg-steel-blue hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 shadow-2xs shadow-steel-blue/20 hover:scale-[1.01]">
                    Explore Builds <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                  </a>
                  <Link href="/about" className="text-xs font-bold px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0f172a] transition-all border border-slate-200">
                    About Suyash →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Slideshow (Compact sleek height) */}
          <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden shadow-2xs border border-slate-200/90 bg-slate-900">
            <HeroSlideshow />
          </div>

        </div>
      </section>

      {/* 2. FEATURED PROJECTS SECTION */}
      <section id="featured-projects" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8 scroll-mt-20">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <span className="font-mono text-xs text-steel-blue font-bold tracking-wider uppercase">HARDWARE & EMBEDDED BUILDS</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight font-heading">
              Featured Projects
            </h2>
          </div>
          <Link href="/projects" className="text-sm font-semibold text-steel-blue hover:underline flex items-center gap-1">
            View all projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-2 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-steel-blue flex items-center justify-center mx-auto">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0f172a]">No projects published yet</h3>
            <p className="text-xs text-cool-slate max-w-md mx-auto">
              Hardware build logs and schematics will appear here once published.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {projects.slice(0, 4).map((project, idx) => {
                const projectUrl = (project.slug && !project.slug.startsWith("http") && !project.slug.includes("/"))
                  ? `/projects/${project.slug}`
                  : `/projects/${project.id}`;

                return (
                  <div 
                    key={project.id || idx} 
                    className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${idx >= 2 ? "hidden sm:flex" : "flex"}`}
                  >
                    <div>
                      <Link href={projectUrl} className="w-full aspect-video bg-slate-900 overflow-hidden block relative">
                        <img 
                          src={project.image_url || "/circuit-schematic.jpg"} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-steel-blue text-white text-[11px] font-bold tracking-wide">
                          {project.category || "IoT"}
                        </span>
                      </Link>
                      <div className="p-4 space-y-2">
                        <h3 className="text-base font-bold text-[#0f172a] leading-snug group-hover:text-steel-blue transition-colors">
                          <Link href={projectUrl}>{project.title}</Link>
                        </h3>
                        <p className="text-xs text-cool-slate leading-relaxed line-clamp-2">
                          {project.short_description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex flex-wrap gap-1.5">
                      {(project.tags || ["ESP32", "MQTT"]).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-[#475569] text-[10px] font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile View All Button */}
            <div className="mt-6 flex justify-center sm:hidden">
              <Link 
                href="/projects" 
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-steel-blue font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                View All Projects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* 3. LATEST RESOURCES SECTION (Placed below Featured Projects & above Video Build Logs) */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <span className="font-mono text-xs text-steel-blue font-bold tracking-wider uppercase">FREE DOWNLOADS & SCHEMATICS</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight font-heading">
              Latest Engineering Resources
            </h2>
          </div>
          <Link href="/resources" className="text-sm font-semibold text-steel-blue hover:underline flex items-center gap-1">
            View all resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {displayResources.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-2 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-steel-blue flex items-center justify-center mx-auto">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0f172a]">No resources published yet</h3>
            <p className="text-xs text-cool-slate max-w-md mx-auto">
              Pinout cheat sheets, CAD libraries, and schematics will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayResources.slice(0, 4).map((resource: any, idx: number) => {
                const resourceUrl = (resource.slug && !resource.slug.startsWith("http") && !resource.slug.includes("/"))
                  ? `/resources/${resource.slug}`
                  : resource.download_url || `/resources/${resource.id}`;

                return (
                  <div 
                    key={resource.id || idx} 
                    className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${idx >= 2 ? "hidden sm:flex" : "flex"}`}
                  >
                    <div>
                      <Link href={resourceUrl} className="w-full aspect-video bg-slate-900 overflow-hidden block relative">
                        <img 
                          src={resource.cover_image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"} 
                          alt={resource.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-steel-blue text-white text-[11px] font-bold tracking-wide">
                          {resource.category || "Resource"}
                        </span>
                      </Link>
                      <div className="p-4 space-y-2">
                        <h3 className="text-base font-bold text-[#0f172a] leading-snug group-hover:text-steel-blue transition-colors line-clamp-1">
                          <Link href={resourceUrl}>{resource.title}</Link>
                        </h3>
                        <p className="text-xs text-cool-slate leading-relaxed line-clamp-2">
                          {resource.detail_text}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link 
                        href={resourceUrl} 
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-steel-blue font-semibold text-xs transition-all border border-slate-200/80 flex items-center justify-center gap-1.5 group-hover:border-steel-blue/30"
                      >
                        <Download className="h-3.5 w-3.5" /> Download / View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile View All Button */}
            <div className="mt-6 flex justify-center sm:hidden">
              <Link 
                href="/resources" 
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-steel-blue font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                View All Resources <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* 4. YOUTUBE VIDEOS SECTION (Placed directly below Resources section) */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <span className="font-mono text-xs text-steel-blue font-bold tracking-wider uppercase">YOUTUBE CHANNEL & BUILD DEMOS</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight font-heading">
              Latest Video Build Logs
            </h2>
          </div>
          <Link href="/videos" className="text-sm font-semibold text-steel-blue hover:underline flex items-center gap-1">
            Explore all videos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {videos.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-2 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-steel-blue flex items-center justify-center mx-auto">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0f172a]">No YouTube videos added yet</h3>
            <p className="text-xs text-cool-slate max-w-md mx-auto">
              Video demonstrations and build logs will appear here soon.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {videos.slice(0, 4).map((video, idx) => {
                const { thumbnailUrl } = parseYouTubeUrl(video.content_url || "");
                const imageSrc = video.thumbnail_url || thumbnailUrl;

                return (
                  <div 
                    key={video.id || idx} 
                    className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${idx >= 2 ? "hidden sm:flex" : "flex"}`}
                  >
                    <div>
                      <a 
                        href={video.content_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-full aspect-video bg-slate-900 overflow-hidden relative block"
                      >
                        <img src={imageSrc} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-steel-blue text-white text-[11px] font-bold">
                          {video.category || "YouTube"}
                        </span>
                        <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/50 flex items-center justify-center transition-all">
                          <div className="w-12 h-12 rounded-full bg-white text-steel-blue flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 fill-current ml-0.5" />
                          </div>
                        </div>
                      </a>
                      <div className="p-4 space-y-2">
                        <h3 className="text-base font-bold text-[#0f172a] leading-snug group-hover:text-steel-blue transition-colors line-clamp-2">
                          <a href={video.content_url} target="_blank" rel="noreferrer">{video.title}</a>
                        </h3>
                        <p className="text-xs text-cool-slate leading-relaxed line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                      <a 
                        href={video.content_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-steel-blue hover:underline flex items-center gap-1"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Watch on YouTube
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Explore All Button */}
            <div className="mt-6 flex justify-center sm:hidden">
              <Link 
                href="/videos" 
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-steel-blue font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                Explore All Videos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* 5. ARTICLES & TUTORIALS SECTION (Only rendered when real articles exist in database) */}
      {articles.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight font-heading">
              Latest Articles & Tutorials
            </h2>
            <Link href="/articles" className="text-sm font-semibold text-steel-blue hover:underline flex items-center gap-1">
              View all articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {articles.slice(0, 4).map((article, idx) => (
              <div 
                key={article.id || idx} 
                className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-3 flex gap-3 items-center hover:shadow-sm transition-all ${idx >= 2 ? "hidden sm:flex" : "flex"}`}
              >
                <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                  <img src={article.cover_image || "/circuit-board-header.jpg"} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xs font-bold text-[#0f172a] leading-snug truncate">
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-cool-slate font-medium">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[#475569]">{article.category || "Tutorial"}</span>
                    <span>{article.reading_time || 5} min read</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="mt-6 flex justify-center sm:hidden">
            <Link 
              href="/articles" 
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-steel-blue font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              View All Articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 5. "HEY, I'M SUYASH" ABOUT FOOTER SECTION */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8 my-6">
        <div className="bg-slate-100/90 rounded-3xl p-8 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200 shrink-0 overflow-hidden border-2 border-white shadow-md">
                <img src="/profile.png" alt="Suyash Desai" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#0f172a]">
                  Hey, <span className="font-extrabold">I'm Suyash.</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-xl">
                  An Electronics & Telecommunication engineering student, passionate builder, and hobbyist. I love turning ideas into reality and sharing the process with you.
                </p>
                <div className="pt-2 flex items-center gap-4 justify-center sm:justify-start">
                  <Link href="/about" className="text-xs font-semibold text-steel-blue hover:underline flex items-center gap-1">
                    About Me <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <div className="flex items-center gap-3.5 text-cool-slate pl-2 border-l border-slate-300">
                    <Link href="https://github.com/astrix884" target="_blank" className="hover:text-[#0f172a]"><GithubIcon className="h-4 w-4" /></Link>
                    <Link href="https://www.youtube.com/@IdeasbySuyashDesai" target="_blank" className="hover:text-[#0f172a]"><YoutubeIcon className="h-4 w-4" /></Link>
                    <Link href="https://www.instagram.com/ideas_by_suyash" target="_blank" className="hover:text-[#0f172a]"><InstagramIcon className="h-4 w-4" /></Link>
                    <Link href="https://www.linkedin.com/in/suyash-desai-659473270" target="_blank" className="hover:text-[#0f172a]"><LinkedinIcon className="h-4 w-4" /></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-8 mt-auto text-xs text-cool-slate">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Suyash Desai. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/privacy" className="hover:text-[#0f172a]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#0f172a]">Terms of Use</Link>
            <span>Built with ❤️ and lots of ☕</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
