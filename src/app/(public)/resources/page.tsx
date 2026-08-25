import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PublicResourcesClient, { PublicResourceItem } from "@/app/(public)/resources/PublicResourcesClient";

export const metadata: Metadata = {
  title: "Resources & Engineering Library | Ideas by Suyash",
  description: "Download pinout cheat sheets, CAD component libraries, schematic templates, and embedded hardware guides created by Suyash Desai.",
};

export default async function ResourcesPage() {
  let resources: PublicResourceItem[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      resources = data as PublicResourceItem[];
    }
  } catch (err) {
    console.error("Failed to load public resources from Supabase:", err);
  }

  const defaultResources: PublicResourceItem[] = [
    {
      id: "res-1",
      title: "ESP32 Pinout Cheat Sheet & Hardware Reference",
      cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      detail_text: "Comprehensive pin mapping, ADC attenuation guide, and GPIO pull-up/pull-down restrictions for ESP32-WROOM-32 and ESP32-S3 boards. Includes power budget calculations and RTC GPIO reference charts.",
      category: "Cheat Sheet",
      download_url: "https://github.com/astrix884",
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "res-2",
      title: "KiCad 8 Custom Component Library for Robotics",
      cover_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      detail_text: "Curated 3D footprints and schematic symbols for popular motor drivers (DRV8825, L298N), IMUs (MPU6050, BNO055), buck converters, and lithium charging modules tailored for compact robotic builds.",
      category: "CAD & PCB",
      download_url: "https://github.com/astrix884",
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "res-3",
      title: "Embedded C++ System Architecture Guide",
      cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      detail_text: "Architectural blueprint for real-time sensor processing loops, FreeRTOS task scheduling, zero-copy buffer allocations, and state machine design patterns in microcontrollers.",
      category: "Guide & Code",
      download_url: "https://github.com/astrix884",
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "res-4",
      title: "LiPo Battery Management & Protection Circuit Schematic",
      cover_image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=800&q=80",
      detail_text: "Reference schematic for 1S/2S LiPo charging using TP4056 and DW01 protection ICs. Includes thermal cut-off logic, load sharing path circuitry, and status LED indicators.",
      category: "Schematics",
      download_url: "https://github.com/astrix884",
      is_published: true,
      created_at: new Date().toISOString(),
    },
  ];

  const displayResources = resources.length > 0 ? resources : defaultResources;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] py-10 sm:py-16 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-steel-blue text-xs font-bold uppercase tracking-wider">
            <span>📚 Technical Resource Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0f172a] font-heading">
            Engineering Tools, Guides & Libraries
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Free developer resources, hardware pinouts, KiCad PCB footprints, code templates, and schematics curated for robotics, IoT, and embedded electronics developers.
          </p>
        </div>

        {/* Public Resources Interactive Client */}
        <PublicResourcesClient initialResources={displayResources} />

      </div>
    </div>
  );
}
