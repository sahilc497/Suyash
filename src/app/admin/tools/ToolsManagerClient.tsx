"use client";

import { useState, useEffect } from "react";
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
  const [toolImagePreview, setToolImagePreview] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("buildpulse_recommended_tools");
      if (stored) {
        setTools(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveTools = (newTools: ToolItem[]) => {
    setTools(newTools);
    try {
      localStorage.setItem("buildpulse_recommended_tools", JSON.stringify(newTools));
      window.dispatchEvent(new Event("tools_updated"));
    } catch (e) {
      console.error(e);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setToolImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTool = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTool: ToolItem = {
      id: Date.now().toString(),
      name: formData.get("name") as string || "New Recommended Tool",
      category: formData.get("category") as string || "Lab Equipment",
      description: formData.get("description") as string || "",
      link_url: formData.get("link_url") as string || "",
      price: formData.get("price") as string || "",
      image_url: toolImagePreview || (formData.get("image_url") as string) || "",
      is_recommended: true,
      display_order: tools.length + 1,
    };

    const updated = [...tools, newTool];
    saveTools(updated);
    setIsNewModalOpen(false);
    setToolImagePreview("");
  };

  const handleUpdateTool = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTool) return;

    const formData = new FormData(e.currentTarget);
    const updatedTool: ToolItem = {
      ...editingTool,
      name: formData.get("name") as string || editingTool.name,
      category: formData.get("category") as string || editingTool.category,
      description: formData.get("description") as string || editingTool.description,
      link_url: formData.get("link_url") as string || editingTool.link_url,
      price: formData.get("price") as string || editingTool.price,
      image_url: toolImagePreview || editingTool.image_url,
    };

    const updated = tools.map(t => t.id === editingTool.id ? updatedTool : t);
    saveTools(updated);
    setEditingTool(null);
    setToolImagePreview("");
  };

  const handleDeleteTool = (id: string) => {
    if (confirm("Are you sure you want to remove this tool link?")) {
      const updated = tools.filter(t => t.id !== id);
      saveTools(updated);
    }
  };

  const toggleRecommended = (id: string) => {
    const updated = tools.map(t => t.id === id ? { ...t, is_recommended: !t.is_recommended } : t);
    saveTools(updated);
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
          <div key={tool.id} className="bg-white border border-[#dddddd] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-mono font-bold rounded-full">
                  {tool.category}
                </span>
                {tool.price && (
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    {tool.price}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-lg text-[#111111] leading-tight">{tool.name}</h3>
              <p className="text-sm text-[#666666] leading-relaxed">{tool.description}</p>

              {tool.link_url && (
                <a
                  href={tool.link_url}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline pt-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Visit Product / Link
                </a>
              )}
            </div>

            <div className="pt-3 border-t border-[#eeeeee] flex items-center justify-between">
              <button
                onClick={() => toggleRecommended(tool.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  tool.is_recommended ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tool.is_recommended ? "✓ Active on Site" : "Hidden"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingTool(tool);
                    setToolImagePreview(tool.image_url || "");
                  }}
                  className="p-2 text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg border border-[#dddddd] cursor-pointer"
                  title="Edit Tool"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTool(tool.id)}
                  className="p-2 text-slate-700 hover:text-red-600 hover:bg-white rounded-lg border border-[#dddddd] cursor-pointer"
                  title="Delete Tool"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Tool */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#dddddd] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-xl font-bold text-[#111111]">Add Recommended Tool / Gear</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTool} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Tool / Equipment Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. TS101 Smart Soldering Iron"
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Category</label>
                <select
                  name="category"
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                  defaultValue="Lab Equipment"
                >
                  <option value="Microcontrollers">Microcontrollers & SoCs</option>
                  <option value="Lab Equipment">Lab Equipment & Instruments</option>
                  <option value="Fabrication">Fabrication & 3D Printing</option>
                  <option value="Software">Software & CAD Toolchain</option>
                  <option value="Quick Link">Quick Link / Community</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  placeholder="Why do you recommend this tool?"
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Link URL (Amazon, Store, GitHub)</label>
                <input
                  name="link_url"
                  type="url"
                  placeholder="https://..."
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Price String (Optional)</label>
                <input
                  name="price"
                  type="text"
                  placeholder="e.g. $59 or Free"
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              {/* Tool Image File Upload */}
              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Tool Photo (Optional Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-[#cccccc] rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg"
                >
                  Save Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Tool */}
      {editingTool && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#dddddd] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <h2 className="text-xl font-bold text-[#111111]">Edit Recommended Tool</h2>
              <button onClick={() => setEditingTool(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTool} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Tool / Equipment Name</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingTool.name}
                  required
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Category</label>
                <select
                  name="category"
                  defaultValue={editingTool.category}
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                >
                  <option value="Microcontrollers">Microcontrollers & SoCs</option>
                  <option value="Lab Equipment">Lab Equipment & Instruments</option>
                  <option value="Fabrication">Fabrication & 3D Printing</option>
                  <option value="Software">Software & CAD Toolchain</option>
                  <option value="Quick Link">Quick Link / Community</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingTool.description}
                  required
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Link URL</label>
                <input
                  name="link_url"
                  type="url"
                  defaultValue={editingTool.link_url}
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444444] uppercase mb-1">Price</label>
                <input
                  name="price"
                  type="text"
                  defaultValue={editingTool.price}
                  className="w-full p-3 border border-[#cccccc] rounded-lg text-sm focus:outline-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setEditingTool(null)}
                  className="px-4 py-2 border border-[#cccccc] rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
