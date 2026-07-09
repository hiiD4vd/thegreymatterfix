"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const WebThreads = dynamic(() => import("./WebThreads"), {
  ssr: false,
  loading: () => null,
});

export default function WebThreadsWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", pointerEvents: "none", zIndex: 0 }}>
      <WebThreads
        color1="#2fa5a0"
        color2="#8b7ec8"
        color3="#ff6b4a"
        backgroundColor="#12172b"
        threadCount={6}
        speed={0.18}
        frequency={isMobile ? 3.5 : 4.5}
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
