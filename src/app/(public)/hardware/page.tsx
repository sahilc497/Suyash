import Link from "next/link";
import { Cpu, Wrench, ShieldCheck, Zap, Layers, Terminal, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Recommended Hardware & Tools | BuildPulse",
  description: "Recommended microcontrollers, lab equipment, fabrication tools, and software used by Suyash Desai.",
};

const defaultCategories = [
  {
    title: "Microcontrollers & Edge Processing",
    icon: Cpu,
    description: "Core processing boards and silicon I use for embedded development and robotics.",
    items: [
      { name: "STM32F4 / STM32H7 Series", category: "Microcontroller", desc: "High-performance ARM Cortex-M microcontrollers for real-time control." },
      { name: "ESP32-S3 Dual-Core SoC", category: "Wireless / AI", desc: "Wi-Fi 4 + BLE 5, vector instructions for on-device ML." },
      { name: "NVIDIA Jetson Orin Nano", category: "Edge AI", desc: "40 TOPS AI inference for autonomous vision and mobile robotics." },
      { name: "Raspberry Pi 5 (8GB)", category: "Single Board Computer", desc: "Linux host controller for high-level robotics nodes and ROS2." },
    ]
  },
  {
    title: "Lab Equipment & Measurement",
    icon: Zap,
    description: "Instruments for signal analysis, power profiling, and debugging physical circuits.",
    items: [
      { name: "Rigol DS1054Z Oscilloscope", category: "Scope", desc: "4-channel 50MHz digital storage oscilloscope." },
      { name: "Saleae Logic Pro 8", category: "Logic Analyzer", desc: "USB logic analyzer for SPI, I2C, UART, and CAN protocol analysis." },
      { name: "Benchtop DC Power Supply (30V/5A)", category: "Power", desc: "Precision adjustable dual-channel power supply with current limiting." },
      { name: "TS101 Smart Soldering Iron", category: "Assembly", desc: "Portable USB-C powered soldering iron with PID temperature control." }
    ]
  },
  {
    title: "Fabrication & Prototyping",
    icon: Wrench,
    description: "Tools for turning 3D CAD models and schematics into physical prototypes.",
    items: [
      { name: "KiCad 8 EDA", category: "PCB Design", desc: "Open-source schematic capture and 3D PCB layout toolchain." },
      { name: "Bambu Lab X1-Carbon / Voron 2.4", category: "3D Printing", desc: "High-speed FDM printers for structural enclosures and mechanical parts." },
      { name: "Desktop PCB Milling CNC", category: "Prototyping", desc: "Rapid isolation routing for prototype circuit boards." }
    ]
  },
  {
    title: "Software & Firmware Stack",
    icon: Terminal,
    description: "Development environments and embedded operating systems.",
    items: [
      { name: "FreeRTOS", category: "RTOS", desc: "Real-time operating system kernel for microcontrollers." },
      { name: "ROS 2 (Humble / Jazzy)", category: "Robotics Framework", desc: "Robot Operating System for node communications and navigation." },
      { name: "PlatformIO / VS Code", category: "IDE", desc: "Cross-platform build system and IDE extensions." }
    ]
  }
];

export default async function HardwarePage() {
  let dbTools: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("recommended_tools")
      .select("*")
      .eq("is_recommended", true)
      .order("display_order", { ascending: true });
    if (data) dbTools = data;
  } catch (e) {
    console.error("Failed to fetch tools:", e);
  }

  return (
    <div className="w-full bg-transparent text-slate-100 min-h-screen py-12">
      <div className="w-full px-6 md:px-12 lg:px-16">
        
        {/* Breadcrumb */}
        <Link href="/" className="inline-block mb-8 text-blue-400 hover:text-blue-300 font-semibold transition-colors text-sm font-mono">
          ← Back to Overview
        </Link>

        {/* Page Title */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3 font-heading">
            Recommended Tools, Gear & Toolchain
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl leading-relaxed font-sans">
            A curated list of microcontrollers, lab oscilloscopes, soldering equipment, 3D printers, and CAD software I use daily to build hardware.
          </p>
        </div>

        {/* Dynamic Tools Grid if DB has records */}
        {dbTools.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold font-heading text-white mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Admin Recommended Inventory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbTools.map((tool) => (
                <div key={tool.id} className="bg-[#12131b]/90 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold uppercase rounded-full">
                        {tool.category}
                      </span>
                      {tool.price && (
                        <span className="text-xs font-mono font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
                          {tool.price}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-heading text-white mb-2">{tool.name}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">{tool.description}</p>
                  </div>

                  {tool.link_url && (
                    <a
                      href={tool.link_url}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold hover:underline border-t border-white/5 pt-3"
                    >
                      Inspect Specs / Store Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default Categories */}
        <div className="space-y-12">
          {defaultCategories.map((category, idx) => {
            const IconComponent = category.icon;
            return (
              <div key={idx} className="bg-[#12131b]/90 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl">
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading text-white">{category.title}</h2>
                    <p className="text-sm text-slate-400 font-sans">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white text-base font-heading">{item.name}</h3>
                        <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
