"use client";

import WebThreadsWrapper from "@/components/v1/WebThreadsWrapper";
import StoryNetwork from "@/components/v1/StoryNetwork";
import HeroSection from "@/components/v1/HeroSection";

export default function TestWebGLPage() {
  return (
    <main className="page-root">
      <WebThreadsWrapper />

      <div style={{ 
        position: "relative",
        zIndex: 10,
        pointerEvents: "none"
      }}>
        <HeroSection />
        
        <div className="network-pull-wrap">
          <StoryNetwork />
        </div>
      </div>

      <footer className="site-footer" style={{ pointerEvents: "auto", position: "relative", zIndex: 10 }}>
        The Grey Matter - a short-film series on the everyday brain (Backup Network).
      </footer>
    </main>
  );
}
