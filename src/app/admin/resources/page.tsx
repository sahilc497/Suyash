import { createClient } from "@/lib/supabase/server";
import ResourcesManagerClient from "@/app/admin/resources/ResourcesManagerClient";

export interface ResourceItem {
  id: string;
  title: string;
  slug?: string;
  cover_image?: string;
  detail_text: string;
  category?: string;
  download_url?: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export default async function AdminResourcesPage() {
  let resources: ResourceItem[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) resources = data as ResourceItem[];
  } catch (err) {
    console.error("Failed to load resources from Supabase:", err);
  }

  const defaultResources: ResourceItem[] = [
    {
      id: "res-1",
      title: "ESP32 Pinout Cheat Sheet & Hardware Reference",
      cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      detail_text: "Comprehensive pin mapping, ADC attenuation guide, and GPIO pull-up/pull-down restrictions for ESP32-WROOM-32 and ESP32-S3 boards.",
      category: "Cheat Sheet",
      download_url: "https://github.com/astrix884",
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "res-2",
      title: "KiCad 8 Custom Component Library for Robotics",
      cover_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      detail_text: "Curated 3D footprints and symbols for popular motor drivers (DRV8825, L298N), IMUs (MPU6050, BNO055), and lithium charging modules.",
      category: "CAD & PCB",
      download_url: "https://github.com/astrix884",
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "res-3",
      title: "Embedded C++ System Architecture Guide",
      cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      detail_text: "Architectural blueprint for real-time sensor processing loops, FreeRTOS task scheduling, and state machine patterns in microcontrollers.",
      category: "Guide & Code",
      download_url: "https://github.com/astrix884",
      is_published: true,
      created_at: new Date().toISOString(),
    },
  ];

  const displayResources = resources.length > 0 ? resources : defaultResources;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#dddddd]">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] font-heading">Resource Library Manager</h1>
          <p className="text-[#666666] text-sm mt-1">
            Upload and organize technical guides, hardware cheat sheets, CAD files, and code templates for the community.
          </p>
        </div>
      </div>

      <ResourcesManagerClient initialResources={displayResources} />
    </div>
  );
}
