"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const WebThreads = dynamic(() => import("../WebThreads"), { ssr: false });

export default function WebThreadsWrapperTest({
  color1 = "#E8A33D",
  color2 = "#ffd166",
  color3 = "#fff8e0",
  backgroundColor = "#12172b",
  speed = 0.18,
  glow = 0.03,
  brightness = 0.6,
  opacity = 0.9,
  threadCount = 6,
}) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 768;
    }
    return false;
  });

  const [position, setPosition] = useState(() => {
    if (typeof window !== "undefined") {
      const h = window.innerHeight || 800;
      const w = window.innerWidth || 1200;
      if (w <= 768) {
        return h >= 900 ? 0.71 : (h >= 750 ? 0.69 : 0.64);
      }
      return h >= 900 ? 0.66 : (h >= 700 ? 0.62 : 0.50);
    }
    return 0.55;
  });

  useEffect(() => {
    const measureAnchor = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      const anchor = document.getElementById("brain-anchor");
      const h = window.innerHeight;

      if (anchor && h > 0) {
        const rect = anchor.getBoundingClientRect();
        if (rect.height > 10) {
          const brainCenterDocY = rect.top + window.scrollY + rect.height / 2;
          const pos = 1.0 - (brainCenterDocY / h);
          const clampedPos = Math.max(0.20, Math.min(0.85, pos));
          setPosition(Number(clampedPos.toFixed(4)));
          return;
        }
      }

      if (h > 0) {
        if (mobile) {
          const fallbackPos = h >= 900 ? 0.71 : (h >= 750 ? 0.69 : 0.64);
          setPosition(fallbackPos);
        } else {
          const fallbackPos = h >= 900 ? 0.66 : (h >= 700 ? 0.62 : 0.50);
          setPosition(fallbackPos);
        }
      }
    };

    measureAnchor();

    const intervalId = setInterval(measureAnchor, 80);
    const stopIntervalTimer = setTimeout(() => clearInterval(intervalId), 2500);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measureAnchor);
    }

    window.addEventListener("resize", measureAnchor);
    window.addEventListener("orientationchange", measureAnchor);

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measureAnchor);
      ro.observe(document.body);
      const anchor = document.getElementById("brain-anchor");
      if (anchor) ro.observe(anchor);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(stopIntervalTimer);
      window.removeEventListener("resize", measureAnchor);
      window.removeEventListener("orientationchange", measureAnchor);
      if (ro) ro.disconnect();
    };
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
        background: backgroundColor,
        pointerEvents: "none",
        overflow: "hidden",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
      }}
    >
      <WebThreads
        color1={color1}
        color2={color2}
        color3={color3}
        backgroundColor={backgroundColor}
        threadCount={threadCount}
        speed={speed}
        frequency={isMobile ? 3.6 : 3.8}
        spread={isMobile ? 0.18 : 0.22}
        taper={isMobile ? 0.85 : 1.0}
        position={position}
        fanMode="center"
        glow={isMobile ? glow * 1.15 : glow}
        falloff={0.55}
        thickness={1.0}
        brightness={brightness}
        opacity={opacity}
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
