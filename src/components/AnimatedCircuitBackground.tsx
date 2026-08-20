"use client";

import { useEffect, useRef } from "react";

export default function AnimatedCircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initCircuit();
    };

    window.addEventListener("resize", handleResize);

    // Mouse Parallax Offset
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.03;
      targetMouseY = (e.clientY - height / 2) * 0.03;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Circuit Line Definition
    interface Point {
      x: number;
      y: number;
    }

    interface CircuitTrace {
      path: Point[];
      width: number;
      pulsePos: number;
      pulseSpeed: number;
      pulseLength: number;
      color: string;
      vias: Point[];
    }

    let traces: CircuitTrace[] = [];

    const initCircuit = () => {
      traces = [];
      const gridSize = 60;
      const cols = Math.ceil(width / gridSize) + 4;
      const rows = Math.ceil(height / gridSize) + 4;

      // Generate realistic PCB trace networks
      const traceCount = Math.min(Math.floor((width * height) / 18000), 75);

      for (let i = 0; i < traceCount; i++) {
        const startCol = Math.floor(Math.random() * cols) - 2;
        const startRow = Math.floor(Math.random() * rows) - 2;
        
        let currX = startCol * gridSize;
        let currY = startRow * gridSize;
        
        const path: Point[] = [{ x: currX, y: currY }];
        const segmentCount = 3 + Math.floor(Math.random() * 4);
        
        let dirX = Math.random() > 0.5 ? 1 : -1;
        let dirY = Math.random() > 0.5 ? 1 : -1;

        for (let s = 0; s < segmentCount; s++) {
          const length = (1 + Math.floor(Math.random() * 3)) * gridSize;
          const mode = Math.floor(Math.random() * 3);

          if (mode === 0) {
            // Horizontal
            currX += dirX * length;
          } else if (mode === 1) {
            // Vertical
            currY += dirY * length;
          } else {
            // 45 degree diagonal
            const diag = length * 0.707;
            currX += dirX * diag;
            currY += dirY * diag;
          }

          path.push({ x: currX, y: currY });
        }

        // Collect Vias (drill holes along the path)
        const vias: Point[] = [path[0], path[path.length - 1]];
        if (path.length > 2 && Math.random() > 0.4) {
          vias.push(path[Math.floor(path.length / 2)]);
        }

        traces.push({
          path,
          width: 2.5 + Math.random() * 2,
          pulsePos: Math.random(),
          pulseSpeed: 0.002 + Math.random() * 0.004,
          pulseLength: 0.15 + Math.random() * 0.1,
          color: Math.random() > 0.3 ? "#e4d88e" : "#f5ea9b", // Golden Aluminum
          vias,
        });
      }
    };

    initCircuit();

    // Helper: calculate point along multi-segment path given distance 0..1
    const getPointOnPath = (path: Point[], progress: number): Point => {
      let totalLen = 0;
      const lengths: number[] = [];

      for (let i = 0; i < path.length - 1; i++) {
        const dx = path[i + 1].x - path[i].x;
        const dy = path[i + 1].y - path[i].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        lengths.push(len);
        totalLen += len;
      }

      let targetDist = progress * totalLen;
      let accumulated = 0;

      for (let i = 0; i < path.length - 1; i++) {
        if (accumulated + lengths[i] >= targetDist) {
          const segProgress = (targetDist - accumulated) / lengths[i];
          return {
            x: path[i].x + (path[i + 1].x - path[i].x) * segProgress,
            y: path[i].y + (path[i + 1].y - path[i].y) * segProgress,
          };
        }
        accumulated += lengths[i];
      }

      return path[path.length - 1];
    };

    // Render Loop
    const render = () => {
      // Smooth mouse movement
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // 1. Rich Emerald Green PCB Background (#075c27 to #004d1f gradient)
      const bgGrad = ctx.createRadialGradient(
        width / 2 + mouseX * 2,
        height / 2 + mouseY * 2,
        100,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, "#0a7a35");
      bgGrad.addColorStop(0.6, "#065724");
      bgGrad.addColorStop(1, "#043d18");

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(mouseX, mouseY);

      // 2. Draw Copper Circuit Traces (Pale Golden-Aluminum)
      for (const trace of traces) {
        ctx.beginPath();
        ctx.moveTo(trace.path[0].x, trace.path[0].y);

        for (let i = 1; i < trace.path.length; i++) {
          ctx.lineTo(trace.path[i].x, trace.path[i].y);
        }

        ctx.strokeStyle = trace.color;
        ctx.lineWidth = trace.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 0.85;
        ctx.stroke();

        // Outer Glow for Traces
        ctx.strokeStyle = "#f3e79b";
        ctx.lineWidth = trace.width + 1.5;
        ctx.globalAlpha = 0.15;
        ctx.stroke();

        // 3. Draw Via Rings & Drill Holes (Gold ring + dark green center)
        for (const via of trace.vias) {
          ctx.globalAlpha = 0.95;
          // Outer Gold Pad
          ctx.beginPath();
          ctx.arc(via.x, via.y, trace.width * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "#e4d88e";
          ctx.fill();
          ctx.strokeStyle = "#cbb860";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Inner Dark Hole
          ctx.beginPath();
          ctx.arc(via.x, via.y, trace.width * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = "#032810";
          ctx.fill();
        }

        // 4. MOVABLE / ANIMATED ELECTRICAL CURRENT PULSE
        trace.pulsePos = (trace.pulsePos + trace.pulseSpeed) % 1;

        const pulseHead = getPointOnPath(trace.path, trace.pulsePos);
        const pulseTailPos = Math.max(0, trace.pulsePos - trace.pulseLength);
        const pulseTail = getPointOnPath(trace.path, pulseTailPos);

        // Glowing Current Pulse Head
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(pulseHead.x, pulseHead.y, trace.width * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#fef08a";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Pulse Tail Line
        ctx.beginPath();
        ctx.moveTo(pulseTail.x, pulseTail.y);
        ctx.lineTo(pulseHead.x, pulseHead.y);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = trace.width * 1.2;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
}
