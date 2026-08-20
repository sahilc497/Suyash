"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, ExternalLink, Save, Check, X, Wrench, DollarSign, Upload } from "lucide-react";

interface ToolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  link_url?: string;
  image_url?: string;
  price?: string;
  is_recommended: boolean;
  display_order?: number;
}

export default function ToolsManagerClient({ initialTools }: { initialTools: ToolItem[] }) {
  const [tools, setTools] = useState<ToolItem[]>(initialTools);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toolImagePreview, setToolImagePreview] = useState<string>("");

  // Sync tools from Supabase DB on mount
  useEffect(() => {
    const syncTools = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("recommended_tools")
          .select("*")
          .order("display_order", { ascending: true });

        if (data && data.length > 0) {
          setTools(data as ToolItem[]);
        }
      } catch (e) {
        console.error("Failed to sync tools from Supabase:", e);
      }
    };
    syncTools();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setToolImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Create Tool in Supabase DB
  const handleCreateTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get("name") as string || "New Recommended Tool";
    const category = formData.get("category") as string || "Lab Equipment";
    const description = formData.get("description") as string || "";
    const link_url = formData.get("link_url") as string || "";
    const price = formData.get("price") as string || "";
    const image_url = toolImagePreview || (formData.get("image_url") as string) || "";

    const supabase = createClient();
    const { data, error } = await supabase
      .from("recommended_tools")
      .insert({
        name,
        category,
        description,
        link_url,
        price,
        image_url,
        is_recommended: true,
        display_order: tools.length + 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating tool in Supabase:", error);
      const fallbackTool: ToolItem = {
        id: Date.now().toString(),
        name,
        category,
        description,
        link_url,
        price,
        image_url,
        is_recommended: true,
        display_order: tools.length + 1,
      };
      setTools([...tools, fallbackTool]);
    } else if (data) {
      setTools([...tools, data as ToolItem]);
    }

    try {
      localStorage.setItem("buildpulse_recommended_tools", JSON.stringify(tools));
      window.dispatchEvent(new Event("tools_updated"));
    } catch (err) {
      console.error(err);
    }

    setIsSubmitting(false);
    setIsNewModalOpen(false);
    setToolImagePreview("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Update Tool in Supabase DB
  const handleUpdateTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTool) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string || editingTool.name;
    const category = formData.get("category") as string || editingTool.category;
    const description = formData.get("description") as string || editingTool.description;
    const link_url = formData.get("link_url") as string || editingTool.link_url;
    const price = formData.get("price") as string || editingTool.price;
    const image_url = toolImagePreview || editingTool.image_url;

    const supabase = createClient();
    const { error } = await supabase
      .from("recommended_tools")
      .update({
        name,
        category,
        description,
        link_url,
        price,
        image_url,
      })
      .eq("id", editingTool.id);

    if (error) {
      console.error("Error updating tool in Supabase:", error);
    }

    const updatedTool: ToolItem = {
      ...editingTool,
      name,
      category,
      description,
      link_url,
      price,
      image_url,
    };

    const updatedList = tools.map(t => t.id === editingTool.id ? updatedTool : t);
    setTools(updatedList);

    try {
      localStorage.setItem("buildpulse_recommended_tools", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("tools_updated"));
    } catch (err) {
      console.error(err);
    }

    setIsSubmitting(false);
    setEditingTool(null);
    setToolImagePreview("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Delete Tool from Supabase DB
  const handleDeleteTool = async (id: string) => {
    if (confirm("Are you sure you want to remove this tool link?")) {
      const supabase = createClient();
      await supabase.from("recommended_tools").delete().eq("id", id);

      const updatedList = tools.filter(t => t.id !== id);
      setTools(updatedList);

      try {
        localStorage.setItem("buildpulse_recommended_tools", JSON.stringify(updatedList));
        window.dispatchEvent(new Event("tools_updated"));
      } catch (err) {
        console.error(err);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  // Toggle Recommended status in Supabase DB
  const toggleRecommended = async (id: string) => {
    const toolToToggle = tools.find(t => t.id === id);
    if (!toolToToggle) return;

    const newRecState = !toolToToggle.is_recommended;

    const supabase = createClient();
    await supabase
      .from("recommended_tools")
      .update({ is_recommended: newRecState })
      .eq("id", id);

    const updatedList = tools.map(t => t.id === id ? { ...t, is_recommended: newRecState } : t);
    setTools(updatedList);

    try {
      localStorage.setItem("buildpulse_recommended_tools", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("tools_updated"));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm flex items-center gap-2 font-medium">
          <Check className="h-5 w-5 text-emerald-600" /> Recommended Tools & Links updated successfully!
        </div>
      )}

      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#dddddd] shadow-xs">
        <p className="text-sm font-medium text-[#555555]">
          Active Tools: <span className="font-bold text-[#111111]">{tools.filter(t => t.is_recommended).length} / {tools.length}</span>
        </p>
        <button
          onClick={() => {
            setToolImagePreview("");
            setIsNewModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Recommended Tool / Link
        </button>
      </div>

      {/* Tools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div 
            key={tool.id} 
            className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all ${
              tool.is_recommended ? "border-[#dddddd]" : "border-red-200 bg-red-50/20 opacity-75"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold bg-[#eeeeee] text-[#555555] px-2 py-0.5 rounded">
                    {tool.category}
                  </span>
                  <h3 className="font-bold text-base text-[#111111]">{tool.name}</h3>
                </div>
                {tool.price && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {tool.price}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#555555] leading-relaxed line-clamp-2">
                {tool.description}
              </p>

              {tool.link_url && (
                <a 
                  href={tool.link_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                >
                  Visit Link <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 mt-4 border-t border-[#eeeeee] flex items-center justify-between">
              <button
                onClick={() => toggleRecommended(tool.id.toString())}
                className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  tool.is_recommended 
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tool.is_recommended ? "● Featured" : "○ Hidden"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingTool(tool);
                    setToolImagePreview(tool.image_url || "");
                  }}
                  className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-[#eeeeee] rounded transition-colors cursor-pointer"
                  title="Edit Tool"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTool(tool.id.toString())}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Delete Tool"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW TOOL MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#dddddd]">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" /> Add Recommended Tool / Link
              </h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-[#888888] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Tool / Equipment Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. TS101 Smart Soldering Iron"
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    defaultValue="Lab Equipment"
                    className="w-full text-xs p-2.5 border border-[#cccccc] rounded bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Lab Equipment">Lab Equipment</option>
                    <option value="Microcontrollers">Microcontrollers</option>
                    <option value="Software">Software</option>
                    <option value="Fabrication">Fabrication</option>
                    <option value="Components">Components</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Price / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    name="price"
                    placeholder="e.g. $59 or Free"
                    className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Link URL *
                </label>
                <input
                  type="url"
                  name="link_url"
                  required
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Short Description *
                </label>
                <textarea
                  name="description"
                  rows={2}
                  required
                  placeholder="Why you recommend this tool or software..."
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-[#cccccc] text-xs font-medium rounded hover:bg-[#eeeeee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Add Recommended Tool"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TOOL MODAL */}
      {editingTool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#dddddd]">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" /> Edit Recommended Tool
              </h2>
              <button onClick={() => setEditingTool(null)} className="text-[#888888] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Tool / Equipment Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingTool.name}
                  required
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    defaultValue={editingTool.category}
                    className="w-full text-xs p-2.5 border border-[#cccccc] rounded bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Lab Equipment">Lab Equipment</option>
                    <option value="Microcontrollers">Microcontrollers</option>
                    <option value="Software">Software</option>
                    <option value="Fabrication">Fabrication</option>
                    <option value="Components">Components</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Price / Tag
                  </label>
                  <input
                    type="text"
                    name="price"
                    defaultValue={editingTool.price}
                    className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Link URL
                </label>
                <input
                  type="url"
                  name="link_url"
                  defaultValue={editingTool.link_url}
                  required
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Short Description *
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingTool.description}
                  required
                  className="w-full text-xs p-2.5 border border-[#cccccc] rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setEditingTool(null)}
                  className="px-4 py-2 border border-[#cccccc] text-xs font-medium rounded hover:bg-[#eeeeee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
