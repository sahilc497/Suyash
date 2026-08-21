import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, BookOpen, Tag, Sparkles } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  let { data: article } = await supabase.from("articles").select("title, excerpt").eq("slug", slug).maybeSingle();
  if (!article) {
    const { data: artById } = await supabase.from("articles").select("title, excerpt").eq("id", slug).maybeSingle();
    article = artById;
  }

  return {
    title: article ? `${article.title} | Ideas by Suyash` : "Article Details",
    description: article?.excerpt || "Technical blog post and engineering guide.",
  };
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
    <div className="w-full bg-[#f8fafc] text-[#0f172a] font-sans min-h-screen py-6 sm:py-10">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        
        {/* Back Link */}
        <Link href="/articles" className="inline-flex items-center gap-2 text-xs font-bold text-cool-slate hover:text-steel-blue transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to All Articles
        </Link>

        {/* Top Header Card */}
        <header className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3.5 py-1 rounded-full bg-steel-blue text-white font-extrabold tracking-wide uppercase text-[11px] shadow-xs">
              {article.category || "Hardware Design"}
            </span>
            {article.reading_time && (
              <span className="px-3.5 py-1 rounded-full bg-slate-100 text-[#475569] font-bold text-[11px] border border-slate-200 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {article.reading_time} min read
              </span>
            )}
            <span className="text-cool-slate font-medium text-xs flex items-center gap-1 ml-auto">
              <Calendar className="h-3.5 w-3.5" /> Published {new Date(article.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f172a] leading-tight font-heading tracking-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-4xl pt-1">
              {article.excerpt}
            </p>
          )}
        </header>

        {/* FULL PAGE SPLIT VIEW: COVER IMAGE ON LEFT, TEXT CONTENT ALL OVER RIGHT */}
        <main className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT SIDE: COVER IMAGE */}
            <div className="lg:col-span-5 w-full space-y-4">
              {article.cover_image ? (
                <div className="w-full aspect-video lg:aspect-4/3 max-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 relative">
                  <img 
                    src={article.cover_image} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video lg:aspect-4/3 max-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 relative flex items-center justify-center p-6 text-slate-400">
                  <BookOpen className="h-16 w-16 text-steel-blue opacity-50" />
                </div>
              )}
            </div>

            {/* RIGHT SIDE: ARTICLE CONTENT & TEXT (ALL OVER RIGHT SIDE) */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight font-heading flex items-center gap-2 pb-3 border-b border-slate-100">
                <Sparkles className="h-5 w-5 text-steel-blue" /> Article Content
              </h2>

              <div className="prose prose-slate max-w-none text-base sm:text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
                {article.content || "Article content will appear here."}
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
