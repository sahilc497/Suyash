"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteButton({
  table,
  id,
}: {
  table: "projects" | "articles";
  id: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${table === "projects" ? "project" : "article"}? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    
    const { error } = await supabase.from(table).delete().eq("id", id);
    
    if (error) {
      alert("Failed to delete: " + error.message);
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-[#999999] hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
