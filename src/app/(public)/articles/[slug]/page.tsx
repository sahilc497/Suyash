import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  let { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!article) {
    const { data: artById } = await supabase
      .from("articles")
      .select("*")
      .eq("id", slug)
      .maybeSingle();
    article = artById;
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="w-full bg-transparent text-gray-100 min-h-screen py-12">
      <div className="max-w-200 mx-auto px-6">
        <Link href="/articles" className="inline-block mb-8 text-[#666666] hover:text-[#111111] transition-colors">
          ← Back to Articles
        </Link>
        
        <header className="mb-10">
          <div className="flex items-center gap-3 text-[13px] text-[#777777] font-mono mb-4">
            <span>{new Date(article.created_at).toLocaleDateString()}</span>
            {article.reading_time && (
              <>
                <span>•</span>
                <span>{article.reading_time} min read</span>
              </>
            )}
            {article.category && (
              <>
                <span>•</span>
                <span className="bg-[#eeeeee] px-2 py-0.5 rounded text-[#555555]">{article.category}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold text-[#111111] mb-6 leading-tight">
            {article.title}
          </h1>
          {article.cover_image && (
            <div className="w-full aspect-video bg-[#eeeeee] border border-[#dddddd] mb-10 overflow-hidden">
              <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}
        </header>

        <div className="prose prose-zinc max-w-none">
          <div className="whitespace-pre-wrap font-sans leading-relaxed text-[#444444] text-[17px]">
            {article.content || ""}
          </div>
        </div>
      </div>
    </div>
  );
}
