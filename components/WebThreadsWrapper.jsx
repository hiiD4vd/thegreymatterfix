"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const WebThreads = dynamic(() => import("./WebThreads"), { ssr: false });

export default function WebThreadsWrapper() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 768;
    }
    return false;
  });

  // Default initial position:
  // Desktop: 0.32 (sesuai hero desktop yang tinggi & ditarik ke atas)
  // Mobile: 0.70 (baseline akurat posisi otak di layar HP)
  const [position, setPosition] = useState(() => {
    if (typeof window !== "undefined") {
      const mobile = window.innerWidth <= 768;
      if (!mobile) return 0.32;
      const h = window.innerHeight || 800;
      return h >= 900 ? 0.71 : (h >= 750 ? 0.69 : 0.64);
    }
    return 0.32;
  });

  useEffect(() => {
    const measureAnchor = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // DESKTOP: Selalu 100% terkunci di 0.32 (tidak disentuh sama sekali)
      if (!mobile) {
        setPosition(0.32);
        return;
      }

      // MOBILE & TABLET: Cari elemen otak (#brain-anchor) dan hitung titik tengahnya
      const anchor = document.getElementById("brain-anchor");
      const h = window.innerHeight;

      if (anchor && h > 0) {
        const rect = anchor.getBoundingClientRect();
        // Pastikan elemen sudah ter-render dengan tinggi valid (> 10px)
        if (rect.height > 10) {
          const brainCenterDocY = rect.top + window.scrollY + rect.height / 2;
          const pos = 1.0 - (brainCenterDocY / h);
          // Batasi rentang wajar mobile (0.45 - 0.85)
          const clampedPos = Math.max(0.45, Math.min(0.85, pos));
          setPosition(Number(clampedPos.toFixed(4)));
          return;
        }
      }

      // Fallback prediktif berbasis tinggi viewport jika anchor belum siap
      if (h > 0) {
        const fallbackPos = h >= 900 ? 0.71 : (h >= 750 ? 0.69 : 0.64);
        setPosition(fallbackPos);
      }
    };

    // Jalankan segera
    measureAnchor();

    // Polling berulang saat halaman pertama kali mount untuk antisipasi font / layout shift
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
        frequency={isMobile ? 3.6 : 3.8}
        spread={isMobile ? 0.18 : 0.22}
        taper={isMobile ? 0.85 : 1.0}
        position={position}
        fanMode="center"
        glow={isMobile ? 0.035 : 0.03}
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