import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Articles</h1>
          <p className="text-[#666666]">Manage your technical blog posts.</p>
        </div>
        <Link href="/admin/articles/new" className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white hover:bg-[#333333] transition-colors">
          <Plus className="h-4 w-4" /> New Article
        </Link>
      </div>

      <div className="bg-white border border-[#dddddd] shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9f9f9] border-b border-[#dddddd] text-[#555555]">
            <tr>
              <th className="px-6 py-3 font-semibold">Title</th>
              <th className="px-6 py-3 font-semibold">Published</th>
              <th className="px-6 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {!articles || articles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#777777]">
                  No articles found. Write one to get started.
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="border-b border-[#eeeeee] hover:bg-[#fafafa]">
                  <td className="px-6 py-4 font-medium text-[#111111]">{article.title}</td>
                  <td className="px-6 py-4">
                    {article.is_published ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Live</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#666666]">{new Date(article.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <DeleteButton table="articles" id={article.id} />
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
