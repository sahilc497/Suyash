"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Play, ExternalLink } from "lucide-react";

interface Slide {
  id: string | number;
  title: string;
  category: string;
  description: string;
  image: string;
  video_url?: string;
  is_active?: boolean;
}

const defaultSlides: Slide[] = [];

export default function HeroSlideshow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Sync slides dynamically from admin updates stored in localStorage or events
  useEffect(() => {
    const loadDynamicSlides = () => {
      try {
        const stored = localStorage.getItem("buildpulse_slideshow_slides");
        if (stored) {
          const parsed = JSON.parse(stored);
          const activeSlides = parsed.filter((s: any) => s.is_active !== false).map((s: any) => ({
            id: s.id,
            title: s.title,
            category: s.category || "BUILD SHOWCASE",
            description: s.description,
            image: s.image_url || s.image || "/circuit-board-header.jpg",
            video_url: s.video_url,
          }));
          setSlides(activeSlides);
        }
      } catch (e) {
        console.error("Error reading stored slideshow slides:", e);
      }
    };

    loadDynamicSlides();
    window.addEventListener("slideshow_updated", loadDynamicSlides);
    return () => window.removeEventListener("slideshow_updated", loadDynamicSlides);
  }, []);

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-full min-h-full rounded-3xl overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center p-8 border border-white/10 text-center">
        <div className="space-y-3 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-steel-blue/20 text-steel-blue flex items-center justify-center mx-auto border border-steel-blue/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Hero Build Slideshow</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No slides active yet. Go to your Admin Dashboard (<strong>/admin/slideshow</strong>) to add custom build slides and videos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full min-h-full rounded-3xl overflow-hidden bg-[#18181b] shadow-2xl group border border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Ratio Optimization */}
            <div className="w-full h-full bg-[#18181b] flex items-center justify-center overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-all duration-700 ease-out"
              />
            </div>

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-linear-to-t from-[#09090b]/95 via-[#09090b]/40 to-transparent" />

            {/* Content Caption Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col justify-end text-white z-20">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3.5 py-1 rounded-full bg-[#27272a]/90 backdrop-blur-md text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md border border-white/10">
                  <Sparkles className="h-3.5 w-3.5 text-[#a1a1aa]" /> {slide.category}
                </span>
                <span className="text-xs font-medium text-[#a1a1aa] backdrop-blur-md bg-[#18181b]/80 px-3 py-1 rounded-full border border-white/10">
                  Build 0{index + 1} / 0{slides.length}
                </span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight leading-tight mb-2 drop-shadow-md">
                {slide.title}
              </h3>
              
              <p className="text-sm sm:text-base text-[#a1a1aa] line-clamp-2 max-w-xl font-sans leading-relaxed drop-shadow-xs mb-4">
                {slide.description}
              </p>

              {/* YouTube / Instagram Pill Button */}
              {slide.video_url && (
                <div>
                  <a
                    href={slide.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black shadow-lg transition-all hover:scale-[1.02] font-sans"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Watch Video <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#171717]/80 text-white hover:bg-[#262626] transition-all opacity-80 hover:opacity-100 backdrop-blur-md cursor-pointer border border-[#404040] shadow-md"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#171717]/80 text-white hover:bg-[#262626] transition-all opacity-80 hover:opacity-100 backdrop-blur-md cursor-pointer border border-[#404040] shadow-md"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-[#171717]/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#262626]">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex ? "w-7 bg-white" : "w-2.5 bg-[#737373]/40 hover:bg-[#737373]/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
