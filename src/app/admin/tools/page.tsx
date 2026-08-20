import { createClient } from "@/lib/supabase/server";
import ToolsManagerClient from "./ToolsManagerClient";

export default async function AdminToolsPage() {
  let tools: any[] = [];
  
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("recommended_tools")
      .select("*")
      .order("display_order", { ascending: true });
      
    if (data) tools = data;
  } catch (err) {
    console.error("Failed to load tools from Supabase:", err);
  }

  const defaultTools = [
    {
      id: "1",
      name: "TS101 Smart Soldering Iron",
      category: "Lab Equipment",
      description: "Portable USB-C powered soldering iron with PID temperature control.",
      link_url: "https://amazon.com",
      price: "$59",
      is_recommended: true,
      display_order: 1,
    },
    {
      id: "2",
      name: "STM32F4 / STM32H7 Microcontrollers",
      category: "Microcontrollers",
      description: "High-performance ARM Cortex-M microcontrollers for real-time control.",
      link_url: "https://st.com",
      price: "$12",
      is_recommended: true,
      display_order: 2,
    },
    {
      id: "3",
      name: "ESP32-S3 Dual-Core Wireless SoC",
      category: "Microcontrollers",
      description: "Wi-Fi 4 + BLE 5, vector instructions for on-device ML.",
      link_url: "https://espressif.com",
      price: "$6",
      is_recommended: true,
      display_order: 3,
    },
    {
      id: "4",
      name: "KiCad 8 EDA Suite",
      category: "Software",
      description: "Open-source schematic capture and 3D PCB layout toolchain.",
      link_url: "https://kicad.org",
      price: "Free",
      is_recommended: true,
      display_order: 4,
    },
    {
      id: "5",
      name: "Rigol DS1054Z Oscilloscope",
      category: "Lab Equipment",
      description: "4-channel 50MHz digital storage oscilloscope.",
      link_url: "https://rigol.com",
      price: "$370",
      is_recommended: true,
      display_order: 5,
    },
    {
      id: "6",
      name: "Bambu Lab X1-Carbon 3D Printer",
      category: "Fabrication",
      description: "High-speed FDM printer for carbon fiber and structural enclosures.",
      link_url: "https://bambulab.com",
      price: "$1449",
      is_recommended: true,
      display_order: 6,
    },
  ];

  const displayTools = tools.length > 0 ? tools : defaultTools;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#dddddd]">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] font-heading">Recommended Tools & Links Manager</h1>
          <p className="text-[#666666] text-sm mt-1">
            Add and manage recommended microcontrollers, lab gear, software, and affiliate links dynamically.
          </p>
        </div>
      </div>

      <ToolsManagerClient initialTools={displayTools} />
    </div>
  );
}
