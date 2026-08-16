import Link from "next/link";
import { LayoutDashboard, FolderKanban, FileText, Video, Settings, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f4f4f4] text-[#333333]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111111] text-white flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-[#222222]">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            BuildPulse <span className="text-[#888888] font-normal">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded text-[#cccccc] hover:bg-[#222222] hover:text-white transition-colors">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/admin/projects" className="flex items-center gap-3 px-3 py-2 rounded text-[#cccccc] hover:bg-[#222222] hover:text-white transition-colors">
            <FolderKanban className="h-5 w-5" /> Projects
          </Link>
          <Link href="/admin/articles" className="flex items-center gap-3 px-3 py-2 rounded text-[#cccccc] hover:bg-[#222222] hover:text-white transition-colors">
            <FileText className="h-5 w-5" /> Articles
          </Link>
          <Link href="/admin/videos" className="flex items-center gap-3 px-3 py-2 rounded text-[#cccccc] hover:bg-[#222222] hover:text-white transition-colors">
            <Video className="h-5 w-5" /> Videos
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded text-[#cccccc] hover:bg-[#222222] hover:text-white transition-colors">
            <Settings className="h-5 w-5" /> Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-[#222222]">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded text-[#888888] hover:bg-[#222222] hover:text-white transition-colors text-sm">
            <LogOut className="h-4 w-4" /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
