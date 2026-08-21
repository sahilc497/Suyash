import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseYouTubeUrl } from "@/lib/youtube";
import Link from "next/link";
import { 
  ArrowLeft, Calendar, FileCode2, ExternalLink, Sparkles, Clock, 
  Images, Video, Wrench, ListOrdered, CheckCircle2, Layers 
} from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.2 5.2 0 0 0-1.5-3.78 4.7 4.7 0 0 0-.15-3.72s-1.2-.38-3.9 1.4a13.38 13.38 0 0 0-7 0c-2.7-1.8-3.9-1.4-3.9-1.4a4.7 4.7 0 0 0-.15 3.72 5.2 5.2 0 0 0-1.5 3.78c0 5.23 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("title, short_description").eq("slug", slug).single();

  return {
    title: project ? `${project.title} | Ideas by Suyash` : "Project Details",
    description: project?.short_description || "Hardware build log, circuit schematics, components and tutorial guide.",
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) {
    notFound();
  }

  // Parse YouTube Video if present
  const youtubeData = project.video_url ? parseYouTubeUrl(project.video_url) : null;

  // Components & Tutorial Steps Arrays
  const componentsList: Array<{ name: string; description?: string; image_url?: string }> = 
    project.components && Array.isArray(project.components) ? project.components : [];

  const tutorialStepsList: Array<{ step_number: number; title: string; description: string; image_url?: string }> = 
    project.tutorial_steps && Array.isArray(project.tutorial_steps) ? project.tutorial_steps : [];

  const galleryImages: string[] = project.gallery_images && Array.isArray(project.gallery_images) 
    ? project.gallery_images 
    : [];

  return (
    <div className="w-full bg-[#f8fafc] text-[#0f172a] font-sans min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 space-y-8">
        
        {/* Back Link */}
        <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-bold text-cool-slate hover:text-steel-blue transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to All Projects
        </Link>

        {/* Project Header Card */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-steel-blue text-white font-extrabold tracking-wide uppercase text-[11px] shadow-xs">
              {project.category || "Arduino & ESP32"}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-[#475569] font-bold text-[11px] border border-slate-200">
              {project.difficulty || "Intermediate"} Level
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-steel-blue font-bold text-[11px] flex items-center gap-1 border border-blue-100">
              <Clock className="h-3 w-3" /> {project.status || "In Progress"}
            </span>
            <span className="text-cool-slate font-medium text-xs flex items-center gap-1 ml-auto">
              <Calendar className="h-3.5 w-3.5" /> Published {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {/* Title & Short Description */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f172a] leading-tight font-heading tracking-tight">
              {project.title}
            </h1>
            <p className="text-sm sm:text-base text-cool-slate leading-relaxed max-w-3xl">
              {project.short_description}
            </p>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.github_url && (
              <a 
                href={project.github_url} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-navy-slate text-white text-xs font-bold transition-all shadow-2xs hover:scale-[1.01]"
              >
                <GithubIcon className="h-4 w-4" /> Source Code on GitHub
              </a>
            )}
            {project.video_url && (
              <a 
                href={project.video_url} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-2xs"
              >
                <Video className="h-4 w-4" /> Watch YouTube Video <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {project.architecture_url && (
              <a 
                href={project.architecture_url} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] border border-slate-200 text-xs font-bold transition-all"
              >
                <FileCode2 className="h-4 w-4 text-steel-blue" /> Circuit Diagram <ExternalLink className="h-3 w-3 text-cool-slate" />
              </a>
            )}
          </div>

          {/* Build Progress Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-[#0f172a]">
              <span>Build Completion Progress</span>
              <span className="font-mono text-steel-blue">{project.progress || 100}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="bg-steel-blue h-full transition-all duration-500 rounded-full" 
                style={{ width: `${project.progress || 100}%` }}
              />
            </div>
          </div>
        </header>

        {/* 1. Cover Image (If Uploaded) */}
        {project.image_url && (
          <div className="w-full aspect-video max-h-120 rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 relative">
            <img 
              src={project.image_url} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 2. PROJECT VIDEO EMBED (IF PRESENT) */}
        {youtubeData && youtubeData.embedUrl && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight font-heading flex items-center gap-2">
              <Video className="h-5 w-5 text-red-600" /> Project Video Demonstration
            </h2>
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-xs">
              <iframe
                src={youtubeData.embedUrl}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {/* 3. REQUIRED COMPONENTS SECTION */}
        {componentsList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight font-heading flex items-center gap-2">
              <Wrench className="h-5 w-5 text-steel-blue" /> Required Hardware Components ({componentsList.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {componentsList.map((comp, idx) => (
                <div 
                  key={idx} 
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    {comp.image_url ? (
                      <div className="w-full aspect-video h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                        <img src={comp.image_url} alt={comp.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-steel-blue">
                        <Wrench className="h-5 w-5" />
                      </div>
                    )}

                    <h3 className="font-bold text-sm text-[#0f172a] leading-snug">{comp.name}</h3>
                    {comp.description && (
                      <p className="text-xs text-cool-slate leading-relaxed">{comp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. STEP-BY-STEP TUTORIAL & ASSEMBLY GUIDE */}
        {tutorialStepsList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight font-heading flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-steel-blue" /> Step-by-Step Build Tutorial ({tutorialStepsList.length} Steps)
            </h2>

            <div className="space-y-6">
              {tutorialStepsList.map((step, idx) => (
                <div 
                  key={idx} 
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-steel-blue text-white text-xs font-extrabold shadow-xs">
                      Step {step.step_number || idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-[#0f172a] font-heading">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {step.description}
                  </p>

                  {/* Optional Step Image */}
                  {step.image_url && (
                    <div className="w-full max-h-96 aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 mt-2">
                      <img src={step.image_url} alt={step.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Architecture / Circuit Diagram Section (If Present) */}
        {project.architecture_url && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight font-heading flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-steel-blue" /> Circuit Schematics & Block Diagram
            </h2>
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center p-4">
              <img 
                src={project.architecture_url} 
                alt="Architecture Diagram" 
                className="max-h-110 object-contain w-auto rounded-xl"
              />
            </div>
          </div>
        )}

        {/* 6. Multiple Project Photo Gallery (If Present) */}
        {galleryImages.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight font-heading flex items-center gap-2">
              <Images className="h-5 w-5 text-steel-blue" /> Additional Photo Gallery ({galleryImages.length})
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {galleryImages.map((imageUrl, idx) => (
                <a 
                  key={idx} 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 block shadow-2xs hover:shadow-md transition-all"
                >
                  <img 
                    src={imageUrl} 
                    alt={`${project.title} photo ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-xs">
                    <ExternalLink className="h-4 w-4" /> View Full Resolution
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 7. Build Log & Specs (If Content Exists) */}
        {project.content && (
          <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xs space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight font-heading flex items-center gap-2 pb-4 border-b border-slate-100">
              <Sparkles className="h-5 w-5 text-steel-blue" /> Additional Build Notes & Firmware Specs
            </h2>
            
            <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
              {project.content}
            </div>
          </article>
        )}

      </div>
    </div>
  );
}
