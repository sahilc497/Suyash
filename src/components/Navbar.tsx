"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.6 5.9 3.5 5 4.7 4.8 8.1 4.3 15.9 4.3 19.3 4.8 20.5 5 21.4 5.9 21.5 7.1 21.8 9.3 21.8 14.7 21.5 16.9 21.4 18.1 20.5 19 19.3 19.2 15.9 19.7 8.1 19.7 4.7 19.2 3.5 19 2.6 18.1 2.5 16.9 2.2 14.7 2.2 9.3 2.5 7.1z"/><path d="m10 15 5-3-5-3z"/></svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/videos", label: "Videos" },
    { href: "/articles", label: "Articles" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 py-3 sm:py-4 border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo Section (Fits cleanly on mobile screens without overflowing) */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform p-1 shrink-0">
            <img src="/logo.png" alt="S.D Creation Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-sm sm:text-lg md:text-xl text-[#0f172a] leading-none tracking-tight group-hover:text-steel-blue transition-colors truncate">
              Suyash Desai
            </span>
            <span className="text-[10px] sm:text-[12px] text-cool-slate font-medium tracking-wide mt-0.5 truncate">
              Electronics • Robotics • IoT
            </span>
          </div>
        </Link>
        
        {/* Desktop Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[16px] font-semibold">
          {navLinks.map((link) => {
            const isActive = link.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? "text-steel-blue font-extrabold"
                    : "text-[#475569] hover:text-[#0f172a]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-steel-blue rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Desktop Social Icons + Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-3.5 text-cool-slate">
            <Link 
              href="https://github.com/astrix884" 
              target="_blank" 
              className="hover:text-[#0f172a] transition-colors p-1 hover:scale-110" 
              aria-label="GitHub"
            >
              <GithubIcon className="h-5 w-5" />
            </Link>
            <Link 
              href="https://www.youtube.com/@IdeasbySuyashDesai" 
              target="_blank" 
              className="hover:text-[#0f172a] transition-colors p-1 hover:scale-110" 
              aria-label="YouTube"
            >
              <YoutubeIcon className="h-5 w-5" />
            </Link>
            <Link 
              href="https://www.instagram.com/ideas_by_suyash" 
              target="_blank" 
              className="hover:text-[#0f172a] transition-colors p-1 hover:scale-110" 
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </Link>
            <Link 
              href="https://www.linkedin.com/in/suyash-desai-659473270" 
              target="_blank" 
              className="hover:text-[#0f172a] transition-colors p-1 hover:scale-110" 
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile 3-Lines Hamburger Menu Button (Guaranteed visible on all mobile phone screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-steel-blue text-white hover:bg-blue-700 font-bold text-xs shadow-xs transition-all shrink-0 active:scale-95"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            ) : (
              <Menu className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            )}
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-mono font-bold">Menu</span>
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 font-semibold text-base">
            {navLinks.map((link) => {
              const isActive = link.href === "/" 
                ? pathname === "/" 
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2.5 px-4 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-50 text-steel-blue font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-around text-cool-slate">
            <Link href="https://github.com/astrix884" target="_blank" className="hover:text-[#0f172a] p-2">
              <GithubIcon className="h-5 w-5" />
            </Link>
            <Link href="https://www.youtube.com/@IdeasbySuyashDesai" target="_blank" className="hover:text-[#0f172a] p-2">
              <YoutubeIcon className="h-5 w-5" />
            </Link>
            <Link href="https://www.instagram.com/ideas_by_suyash" target="_blank" className="hover:text-[#0f172a] p-2">
              <InstagramIcon className="h-5 w-5" />
            </Link>
            <Link href="https://www.linkedin.com/in/suyash-desai-659473270" target="_blank" className="hover:text-[#0f172a] p-2">
              <LinkedinIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
