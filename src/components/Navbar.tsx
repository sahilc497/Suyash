import Link from "next/link";
import { Search, Menu } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.6 5.9 3.5 5 4.7 4.8 8.1 4.3 15.9 4.3 19.3 4.8 20.5 5 21.4 5.9 21.5 7.1 21.8 9.3 21.8 14.7 21.5 16.9 21.4 18.1 20.5 19 19.3 19.2 15.9 19.7 8.1 19.7 4.7 19.2 3.5 19 2.6 18.1 2.5 16.9 2.2 14.7 2.2 9.3 2.5 7.1z"/><path d="m10 15 5-3-5-3z"/></svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
);

export default function Navbar() {
  return (
    <div 
      className="w-full relative flex flex-col items-center justify-center bg-zinc-900 border-b-4 border-blue-600"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url("/header-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '3rem 1rem 1rem 1rem',
      }}
    >
      {/* Title */}
      <Link href="/">
        <h1 className="text-white hover:text-gray-200 transition-colors text-5xl md:text-6xl font-bold tracking-tight mb-4 drop-shadow-md cursor-pointer">
          Suyash Desai
        </h1>
      </Link>
      
      {/* Social Icons */}
      <div className="flex items-center gap-6 mb-6">
        <Link href="#" className="text-white hover:text-gray-300 transition-colors drop-shadow-sm">
          <XIcon className="h-6 w-6" />
        </Link>
        <Link href="https://www.youtube.com/@IdeasbySuyashDesai" target="_blank" className="text-white hover:text-gray-300 transition-colors drop-shadow-sm">
          <YoutubeIcon className="h-6 w-6" />
        </Link>
        <Link href="https://www.instagram.com/ideas_by_suyash" target="_blank" className="text-white hover:text-gray-300 transition-colors drop-shadow-sm">
          <InstagramIcon className="h-6 w-6" />
        </Link>
      </div>
      
      {/* Navigation Links */}
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-white font-medium text-lg drop-shadow-sm">
        <Link href="/projects" className="hover:text-blue-400 transition-colors">Projects</Link>
        <Link href="/articles" className="hover:text-blue-400 transition-colors">Articles</Link>
        <Link href="/videos" className="hover:text-blue-400 transition-colors">Videos</Link>
        <Link href="/about" className="hover:text-blue-400 transition-colors">About</Link>
      </div>
    </div>
  );
}
