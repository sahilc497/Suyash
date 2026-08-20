import { createClient } from "@/lib/supabase/server";
import { Settings, User, Key, ShieldCheck } from "lucide-react";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#111111] mb-2 flex items-center gap-3">
          <Settings className="h-7 w-7 text-steel-blue" /> Admin Settings
        </h1>
        <p className="text-[#666666] text-sm">
          Manage your account credentials and system security settings.
        </p>
      </div>

      <div className="bg-white border border-[#dddddd] shadow-xs p-6 space-y-6 rounded-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-steel-blue flex items-center justify-center font-bold">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#111111] text-base">Active Account</h3>
            <p className="text-xs text-[#666666] font-mono">{user?.email || "Authenticated Admin"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-[#111111]">Authentication Provider</p>
                <p className="text-xs text-[#666666]">Supabase Auth SSR</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-steel-blue" />
              <div>
                <p className="text-xs font-bold text-[#111111]">User ID (UUID)</p>
                <p className="text-xs text-[#666666] font-mono">{user?.id || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
