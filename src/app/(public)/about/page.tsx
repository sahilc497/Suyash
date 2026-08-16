export const metadata = {
  title: "About | BuildPulse",
  description: "About the creator and the hardware lab.",
};

import SponsorForm from "@/components/SponsorForm";

export default function AboutPage() {
  return (
    <div className="w-full bg-[#fcfcfc] text-[#333333] min-h-screen py-12">
      <div className="max-w-[800px] mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#111111] mb-8">About</h1>
        
        <div className="prose prose-zinc max-w-none prose-p:text-[#444444] prose-headings:text-[#111111]">
          <div className="md:float-left md:mr-8 mb-6 md:mb-2 w-full md:w-64 aspect-square bg-[#eeeeee] border border-[#dddddd] overflow-hidden">
            <img src="/profile.png" alt="Suyash Desai" className="w-full h-full object-cover" />
          </div>
          <p className="text-[17px] leading-relaxed mb-6">
            I'm <strong>Suyash Desai</strong>, a hardware engineer and creator. My work focuses on 
            bridging the gap between low-level electronics and high-level software. I build systems 
            that interact with the physical world—from custom flight controllers and autonomous 
            navigation robots to embedded AI systems.
          </p>
          
          <h2 className="text-2xl font-semibold mt-10 mb-4">The Laboratory</h2>
          <p className="text-[17px] leading-relaxed mb-6">
            Everything you see here is designed, prototyped, and built in my personal lab. My setup 
            includes a mix of traditional electronics test equipment (oscilloscopes, logic analyzers) 
            and digital fabrication tools (3D printers, CNC routers, and PCB milling).
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Why BuildPulse?</h2>
          <p className="text-[17px] leading-relaxed mb-6">
            I built this site to serve as a proper engineering wiki for my projects. While YouTube 
            is great for storytelling, it's terrible for documentation. Here, you'll find the 
            actual schematics, source code, bill of materials (BOM), and step-by-step build logs 
            so you can replicate or learn from my experiments.
          </p>
          
          <SponsorForm />
        </div>
      </div>
    </div>
  );
}
