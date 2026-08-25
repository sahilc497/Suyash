"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Download, ExternalLink, Tag, X, FileText, ArrowRight, BookOpen } from "lucide-react";

export interface PublicResourceItem {
  id: string;
  title: string;
  slug?: string;
  cover_image?: string;
  detail_text: string;
  category?: string;
  download_url?: string;
  is_published?: boolean;
  created_at?: string;
}

export default function PublicResourcesClient({ initialResources }: { initialResources: PublicResourceItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(initialResources.map((r) => r.category || "General")))];

  // Filter resources by category and search term
  const filteredResources = initialResources.filter((r) => {
    const matchesCategory = selectedCategory === "All" || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.detail_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.category && r.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources, pinouts..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-steel-blue focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-steel-blue text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Resources */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No resources found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search filter or category selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredResources.map((resource) => {
            const targetUrl = `/resources/${resource.slug || resource.id}`;

            return (
              <div
                key={resource.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Cover Image & Header Link */}
                  <Link href={targetUrl} className="block relative h-52 bg-slate-900 overflow-hidden cursor-pointer">
                    <img
                      src={resource.cover_image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                    <span className="absolute top-3.5 left-3.5 bg-steel-blue/90 backdrop-blur-xs text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg">
                      {resource.category || "General"}
                    </span>

                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                      <h3 className="font-extrabold text-lg line-clamp-2 leading-snug group-hover:text-blue-200 transition-colors">
                        {resource.title}
                      </h3>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <Link href={targetUrl} className="block p-5 space-y-3 cursor-pointer">
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {resource.detail_text}
                    </p>
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={targetUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-steel-blue transition-colors cursor-pointer"
                  >
                    <FileText className="h-4 w-4" /> View Full Page <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {resource.download_url && (
                    <a
                      href={resource.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-steel-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
                    >
                      <span>Access</span> <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
