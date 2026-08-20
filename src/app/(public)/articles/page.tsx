import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, FileText } from "lucide-react";

export const metadata = {
  title: "Articles & Tutorials | Ideas by Suyash",
  description: "Technical articles, hardware design guides, and engineering thoughts by Suyash Desai.",
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
    <div className="w-full bg-[#f8fafc] text-[#0f172a] font-sans min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-8">
        
        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-steel-blue text-xs font-bold tracking-wider uppercase font-mono">
            TUTORIALS • GUIDES • ARTICLES
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight font-heading">
            Articles & Engineering Guides
          </h1>
          <p className="text-base text-cool-slate leading-relaxed max-w-2xl">
            Deep dives into embedded programming, robotics software, microcontroller protocols, and hardware design tips.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-steel-blue flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0f172a]">No articles published yet</h3>
            <p className="text-xs text-cool-slate max-w-md mx-auto">
              Engineering guides and deep-dive technical articles will appear here as soon as they are published.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="flex items-center gap-3 text-xs font-semibold text-cool-slate">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-steel-blue">{article.category || "Hardware"}</span>
                  <span>•</span>
                  <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{article.reading_time || 5} min read</span>
                </div>
                <h2 className="text-xl font-bold text-[#0f172a] hover:text-steel-blue transition-colors">
                  <Link href={`/articles/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>
                <p className="text-xs sm:text-sm text-cool-slate leading-relaxed">
                  {article.excerpt || article.short_description}
                </p>
                <div className="pt-2">
                  <Link href={`/articles/${article.slug}`} className="text-steel-blue hover:underline text-xs font-bold flex items-center gap-1">
                    Read full article <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
