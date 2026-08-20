import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Projects</h1>
          <p className="text-[#666666]">Manage your hardware build logs.</p>
        </div>
        <Link href="/admin/projects/new" className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white hover:bg-[#333333] transition-colors">
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>

      <div className="bg-white border border-[#dddddd] shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9f9f9] border-b border-[#dddddd] text-[#555555]">
            <tr>
              <th className="px-6 py-3 font-semibold">Title</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Published</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {!projects || projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#777777]">
                  No projects found. Create one to get started.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="border-b border-[#eeeeee] hover:bg-[#fafafa]">
                  <td className="px-6 py-4 font-medium text-[#111111]">{project.title}</td>
                  <td className="px-6 py-4 text-[#666666]">{project.status}</td>
                  <td className="px-6 py-4">
                    {project.is_published ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Live</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#666666]">{new Date(project.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton table="projects" id={project.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
