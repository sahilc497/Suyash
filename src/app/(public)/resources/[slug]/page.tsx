import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Download, ExternalLink, FileText, Tag, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const defaultResources = [
  {
    id: "res-1",
    slug: "esp32-pinout-cheat-sheet",
    title: "ESP32 Pinout Cheat Sheet & Hardware Reference",
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    detail_text: `Comprehensive pin mapping, ADC attenuation guide, and GPIO pull-up/pull-down restrictions for ESP32-WROOM-32 and ESP32-S3 boards.

Key Topics Covered:
• ADC1 vs ADC2 Channel Restrictions (ADC2 unavailable when Wi-Fi is active)
• Strapping Pins (GPIO 0, 2, 5, 12, 15) and boot mode states
• Touch Sensor Channels & Capacitive Sensing Pins
• SPI, I2C, and UART default pin assignments for Arduino & ESP-IDF
• Power budget, LDO heat dissipation, and 3.3V current limits

Usage Instructions:
Refer to this hardware pinout sheet whenever wiring sensors, OLED displays, motor drivers, or external microcontrollers to prevent accidental pin contention or boot lockouts.`,
    category: "Cheat Sheet",
    download_url: "https://github.com/astrix884",
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "res-2",
    slug: "kicad-8-custom-component-library",
    title: "KiCad 8 Custom Component Library for Robotics",
    cover_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    detail_text: `Curated 3D footprints and schematic symbols for popular motor drivers (DRV8825, L298N), IMUs (MPU6050, BNO055), buck converters, and lithium charging modules tailored for compact robotic builds.

Included Libraries:
• Motor Drivers: DRV8825, TB6612FNG, Nema 17 Stepper Connectors
• Sensors & IMUs: MPU6050 6-DOF, BNO055 9-DOF, VL53L0X Time-of-Flight
• Power Management: TP4056 USB-C Charger, LM2596 Buck Converter, XL6009 Boost Converter
• Microcontrollers: ESP32 NodeMCU, STM32 BluePill, Raspberry Pi Pico W

How to Install:
1. Download the zipped library from the link above.
2. Open KiCad 8 -> Preferences -> Manage Symbol/Footprint Libraries.
3. Add the extracted folders as global project dependencies.`,
    category: "CAD & PCB",
    download_url: "https://github.com/astrix884",
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "res-3",
    slug: "embedded-cpp-system-architecture",
    title: "Embedded C++ System Architecture Guide",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    detail_text: `Architectural blueprint for real-time sensor processing loops, FreeRTOS task scheduling, zero-copy buffer allocations, and state machine design patterns in microcontrollers.

Core Principles & Patterns:
• Non-Blocking Event Loops vs FreeRTOS Task Scheduling
• Safe Interrupt Handling (ISR) with volatile flags & ring buffers
• Memory Optimization: Avoiding dynamic allocation (malloc/new) in embedded runtime
• Modular Driver Design for I2C/SPI Sensor Peripherals

Target Frameworks:
Compatible with ESP-IDF, STM32 HAL, FreeRTOS, and Arduino C++.`,
    category: "Guide & Code",
    download_url: "https://github.com/astrix884",
    is_published: true,
    created_at: new Date().toISOString(),
  },
];

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let resource: any = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("resources").select("title, detail_text").eq("slug", slug).maybeSingle();
    resource = data;

    if (!resource) {
      const { data: resById } = await supabase.from("resources").select("title, detail_text").eq("id", slug).maybeSingle();
      resource = resById;
    }
  } catch (err) {
    console.error(err);
  }

  if (!resource) {
    resource = defaultResources.find((r) => r.slug === slug || r.id === slug);
  }

  return {
    title: resource ? `${resource.title} | Ideas by Suyash` : "Resource Details",
    description: resource?.detail_text?.slice(0, 160) || "Engineering guide and developer resource.",
  };
}

export default async function ResourceDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  let resource: any = null;

  try {
    const supabase = await createClient();

    let { data } = await supabase
      .from("resources")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) {
      const { data: resById } = await supabase
        .from("resources")
        .select("*")
        .eq("id", slug)
        .maybeSingle();
      data = resById;
    }

    resource = data;
  } catch (err) {
    console.error("Failed to query resource by slug/id:", err);
  }

  if (!resource) {
    resource = defaultResources.find((r) => r.slug === slug || r.id === slug);
  }

  if (!resource) {
    notFound();
  }

  return (
    <div className="w-full bg-[#f8fafc] text-[#0f172a] font-sans min-h-screen py-6 sm:py-10">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-steel-blue transition-colors px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Resources
          </Link>

          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {resource.created_at
              ? new Date(resource.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recent"}
          </span>
        </div>

        {/* Top Header Title Card */}
        <header className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-steel-blue text-white font-extrabold tracking-wider uppercase text-[11px] shadow-2xs">
              {resource.category || "Resource"}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Resource
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] leading-tight font-heading tracking-tight">
            {resource.title}
          </h1>
        </header>

        {/* FULL PAGE SPLIT & SPRAWLING DETAIL VIEW */}
        <main className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xs space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: COVER IMAGE & DOWNLOAD ACTION CARD */}
            <div className="lg:col-span-5 w-full space-y-6">
              <div className="w-full aspect-video lg:aspect-4/3 max-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 relative group">
                <img
                  src={resource.cover_image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"}
                  alt={resource.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xs text-white text-xs font-mono font-bold px-3 py-1 rounded-lg">
                  {resource.category || "Technical File"}
                </span>
              </div>

              {/* Action Box */}
              {resource.download_url ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Resource Download Available</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Access source files, schematic diagrams, CAD models, or code repositories linked with this resource.
                  </p>
                  <a
                    href={resource.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-6 bg-steel-blue hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Download / Access Resource <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">
                    This resource is provided as reference documentation.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: WHOLE PAGE DETAILS & EXPLANATION */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight font-heading flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Sparkles className="h-5 w-5 text-steel-blue" /> Resource Details & Overview
              </h2>

              <div className="prose prose-slate max-w-none text-base sm:text-lg leading-relaxed text-slate-700 whitespace-pre-line font-sans">
                {resource.detail_text}
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
