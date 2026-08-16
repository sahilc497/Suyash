import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FolderKanban, FileText, TrendingUp, Plus } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // Fetch basic stats
  const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  const { count: articlesCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-[#111111] mb-2">Overview</h1>
      <p className="text-[#666666] mb-8">Welcome back to the BuildPulse laboratory.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 border border-[#dddddd] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#555555] uppercase tracking-wide">Total Projects</h3>
            <FolderKanban className="h-5 w-5 text-[#888888]" />
          </div>
          <p className="text-4xl font-bold text-[#111111]">{projectsCount || 0}</p>
        </div>
        
        <div className="bg-white p-6 border border-[#dddddd] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#555555] uppercase tracking-wide">Total Articles</h3>
            <FileText className="h-5 w-5 text-[#888888]" />
          </div>
          <p className="text-4xl font-bold text-[#111111]">{articlesCount || 0}</p>
        </div>
        
        <div className="bg-white p-6 border border-[#dddddd] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#555555] uppercase tracking-wide">Site Traffic</h3>
            <TrendingUp className="h-5 w-5 text-[#888888]" />
          </div>
          <p className="text-4xl font-bold text-[#111111]">---</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-[#111111] mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/projects/new" className="flex items-center justify-between p-4 bg-white border border-[#dddddd] shadow-sm hover:border-blue-600 group transition-colors">
          <div>
            <p className="font-semibold text-[#111111] group-hover:text-blue-600 transition-colors">Publish New Project</p>
            <p className="text-sm text-[#666666]">Create a new build log with schematics.</p>
          </div>
          <Plus className="h-5 w-5 text-[#888888] group-hover:text-blue-600" />
        </Link>
        <Link href="/admin/articles/new" className="flex items-center justify-between p-4 bg-white border border-[#dddddd] shadow-sm hover:border-blue-600 group transition-colors">
          <div>
            <p className="font-semibold text-[#111111] group-hover:text-blue-600 transition-colors">Write New Article</p>
            <p className="text-sm text-[#666666]">Draft a technical blog post.</p>
          </div>
          <Plus className="h-5 w-5 text-[#888888] group-hover:text-blue-600" />
        </Link>
      </div>
    </div>
  );
}
