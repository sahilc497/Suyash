import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileCode2 } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.2 5.2 0 0 0-1.5-3.78 4.7 4.7 0 0 0-.15-3.72s-1.2-.38-3.9 1.4a13.38 13.38 0 0 0-7 0c-2.7-1.8-3.9-1.4-3.9-1.4a4.7 4.7 0 0 0-.15 3.72 5.2 5.2 0 0 0-1.5 3.78c0 5.23 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

interface PageProps {
  params: Promise<{ slug: string }>;
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

  return (
    <div className="w-full bg-[#fcfcfc] text-[#333333] min-h-screen py-12">
      <div className="max-w-[800px] mx-auto px-6">
        <Link href="/projects" className="inline-block mb-8 text-[#666666] hover:text-[#111111] transition-colors">
          ← Back to Projects
        </Link>
        
        <header className="mb-10">
          <div className="flex items-center gap-3 text-[13px] text-[#777777] font-mono mb-4 flex-wrap">
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span className="bg-[#eeeeee] px-2 py-0.5 rounded text-[#555555]">{project.difficulty || "Intermediate"}</span>
            <span>•</span>
            <span className="text-blue-600">{project.status}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-[#111111] mb-6 leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] text-white hover:bg-[#333333] transition-colors text-sm font-medium">
                <GithubIcon className="h-4 w-4" /> Source Code
              </a>
            )}
            {project.architecture_url && (
              <a href={project.architecture_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 border border-[#cccccc] text-[#333333] hover:bg-[#f9f9f9] transition-colors text-sm font-medium">
                <FileCode2 className="h-4 w-4" /> Architecture Diagram
              </a>
            )}
          </div>
          
          <div className="w-full bg-[#eeeeee] h-2 mb-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
          </div>
          <div className="text-right text-xs font-mono text-[#666666] mb-10">
            Build Progress: {project.progress}%
          </div>
        </header>

        <div className="prose prose-zinc max-w-none">
          <div className="whitespace-pre-wrap font-sans leading-relaxed text-[#444444] text-[17px]">
            {project.content || ""}
          </div>
        </div>
      </div>
    </div>
  );
}
