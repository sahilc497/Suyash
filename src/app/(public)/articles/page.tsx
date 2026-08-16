import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Articles | BuildPulse",
  description: "Technical articles, guides, and engineering thoughts.",
};

export default async function ArticlesPage() {
  let articles: any[] = [];
  
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
      
    if (data) articles = data;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
  }

  return (
    <div className="w-full bg-[#fcfcfc] text-[#333333] min-h-screen py-12">
      <div className="max-w-[800px] mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#111111] mb-2">Articles & Guides</h1>
        <p className="text-[17px] text-[#555555] mb-12">
          Deep dives into embedded systems, robotics software, and hardware design.
        </p>

        {articles.length === 0 ? (
          <div className="p-8 border border-dashed border-[#cccccc] bg-[#f9f9f9] text-center text-[#777777]">
            <p>No articles published yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <article key={article.id} className="border-b border-[#eeeeee] pb-8">
                <div className="flex items-center gap-3 text-[13px] text-[#777777] font-mono mb-2">
                  <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                </div>
                <h2 className="text-2xl font-semibold text-[#111111] mb-3">
                  <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                    {article.title}
                  </Link>
                </h2>
                <p className="text-[16px] text-[#555555] leading-relaxed mb-4">
                  {article.excerpt}
                </p>
                <Link href={`/articles/${article.slug}`} className="text-blue-600 hover:underline text-[15px] font-medium">
                  Read full article →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
