"use client";

import dynamic from "next/dynamic";
import StoryNetworkWebGL from "@/components/StoryNetworkWebGL"; 
import HeroSection from "@/components/HeroSection"; // Memasukkan judul & teks

// Import komponen WebThreads secara dinamis tanpa SSR
const WebThreads = dynamic(() => import("@/components/WebThreads"), { ssr: false });

export default function TestWebGLPage() {
  return (
    <main style={{ 
      width: "100%", 
      backgroundColor: "#12172b", // Biru navy polos
      position: "relative"
    }}>
      
      {/* Layer Canvas WebGL: Hanya 100vh di atas, ikut scroll ke atas */}
      <div style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100vw",
        height: "100vh", 
        zIndex: 0,
        overflow: "hidden",
        // Mask ini yang bikin garis WebGL "memudar" ke bawah, gak patah/terpotong!
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)"
      }}>
        <WebThreads
          color1="#E8A33D"
          color2="#ffd166"
          color3="#fff8e0"
          backgroundColor="#12172b"
          threadCount={6}
          speed={0.18}
          frequency={4.5}
          spread={0.22}
          taper={1.0}
          position={0.32}
          fanMode="center"
          glow={0.03}
          falloff={0.55}
          thickness={1.0}
          brightness={0.6}
          opacity={0.9}
          mirror={true}
          shimmer={true}
          grain={false}
          grainIntensity={0}
          mouseInteraction={true}
          mouseStrength={0.35}
        />
      </div>

      {/* Layer Teks Hero & Konten: Mengapung di atas WebGL (z-index lebih tinggi) */}
      <div style={{ 
        position: "relative",
        zIndex: 10,
        pointerEvents: "none" // Biarkan mouse tembus ke canvas WebGL di area kosong
      }}>
        <HeroSection />
        
        {/* Layer Konten Bawah (Otak & Kartu) ditarik ke atas di desktop, diturunkan di mobile via CSS */}
        <div className="network-pull-wrap">
          <StoryNetworkWebGL />
        </div>
      </div>

    </main>
  );
}
