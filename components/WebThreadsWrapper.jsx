"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const WebThreads = dynamic(() => import("./WebThreads"), { ssr: false });

export default function WebThreadsWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        background: "#12172b",
        pointerEvents: "none",
        overflow: "hidden",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)"
      }}
    >
      <WebThreads
        color1="#E8A33D"
        color2="#ffd166"
        color3="#fff8e0"
        backgroundColor="#12172b"
        threadCount={6}
        speed={0.18}
        frequency={isMobile ? 3.5 : 3.8}
        spread={isMobile ? 0.12 : 0.22}
        taper={isMobile ? 0.6 : 1.0}
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
        mouseInteraction={!isMobile}
        mouseStrength={0.35}
      />
    </div>
  );
}