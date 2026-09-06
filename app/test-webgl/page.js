"use client";

import WebThreadsWrapper from "@/components/WebThreadsWrapper";
import StoryNetworkWebGL from "@/components/StoryNetworkWebGL"; 
import HeroSection from "@/components/HeroSection"; // Memasukkan judul & teks

export default function TestWebGLPage() {
  return (
    <main style={{ 
      width: "100%", 
      backgroundColor: "#12172b", // Biru navy polos
      position: "relative"
    }}>
      
      {/* WebThreads: responsive wrapper (desktop 0.32, mobile dinaikkan ke pusat otak) */}
      <WebThreadsWrapper />

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
