export const metadata = {
  title: "About Suyash Desai | Hardware & Systems Engineer",
  description: "Learn more about Suyash Desai, an Electronics & Telecommunication engineering student, hardware engineer, and creator.",
};

import SponsorForm from "@/components/SponsorForm";
import { Cpu, Wrench, Bot, Wifi } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full bg-transparent text-slate-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8 font-orbitron">
          About Suyash Desai
        </h1>
        
        <div className="bg-white/90 p-8 sm:p-10 rounded-2xl border border-cyan-600/20 shadow-sm backdrop-blur-md space-y-8">
          
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-64 aspect-square bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-sm shrink-0">
              <img src="/profile.png" alt="Suyash Desai" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold font-mono">
                <span className="h-2 w-2 rounded-full bg-cyan-600 animate-pulse" />
                E&TC ENGINEERING STUDENT • HOBBYIST • BUILDER • CREATOR
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                Suyash Desai
              </h2>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
                Hi, I'm <strong>Suyash!!</strong> An Electronics & Telecommunication engineering student and a hobbyist who enjoys building things with electronics, robotics, and technology.
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                I like taking an idea, experimenting with it, figuring out how the hardware and software work together, and turning it into something real. A lot of what I learn comes from simply building, breaking, debugging, and trying again.
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                I also create and share engineering content to make technical concepts, project ideas, and things I've learned easier for other students and curious makers to explore.
              </p>
            </div>
          </div>

          {/* Key Areas of Focus */}
          <div className="pt-6 border-t border-slate-200/80">
            <h3 className="text-xl font-bold text-slate-900 mb-6 font-orbitron">
              Areas of Focus
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 shrink-0">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Embedded Systems & Firmware</h4>
                  <p className="text-xs text-slate-600 mt-1">C/C++, MicroPython, ESP32, STM32, Arduino, ARM Cortex architecture.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Robotics & Flight Control</h4>
                  <p className="text-xs text-slate-600 mt-1">Autonomous navigation, custom flight controllers, motor drivers, sensor fusion.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 shrink-0">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Hardware & PCB Prototyping</h4>
                  <p className="text-xs text-slate-600 mt-1">Schematic capture, PCB design, component sourcing, physical prototyping.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 shrink-0">
                  <Wifi className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">IoT & Edge Intelligence</h4>
                  <p className="text-xs text-slate-600 mt-1">MQTT, real-time wireless telemetry, cloud connectivity, edge AI deployment.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Building in Public */}
          <div className="pt-6 border-t border-slate-200/80 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 font-orbitron">
              Building & Documenting in Public
            </h3>
            <p className="text-slate-700 text-base leading-relaxed">
              I believe engineering is best learned and shared by doing. On this site and across my social channels, I document full build journeys—from initial schematic design to source code, bill of materials (BOM), and step-by-step assembly logs.
            </p>
            <p className="text-slate-700 text-base leading-relaxed">
              Whether creating high-speed telemetry systems or autonomous robotics platforms, my goal is to build reliable hardware systems and share open-source resources so fellow engineers and makers can learn from or replicate my experiments.
            </p>
          </div>
          
          <SponsorForm />
        </div>
      </div>
    </div>
  );
}
