"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { STORIES } from "@/lib/v2/stories";

export default function Preloader({ onComplete }) {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  // null = belum cek session. Jangan render overlay dulu, biar balik dari detail
  // tidak sempat flash halaman preload sebelum sessionStorage terbaca.
  const [skipped, setSkipped] = useState(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem("gm-preloader-complete") === "1") {
      setSkipped(true);
      return;
    }

    setSkipped(false);
    document.body.style.overflow = "hidden";
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      setProgress(100);
      setIsLoaded(true);
      requestAnimationFrame(() => gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" }
      ));
    };

    const waitForAssets = async () => {
      // Explicit manifest: do not wait for browser lazy-images in document.images.
      // They may never request until after ENTER, which caused the 61% deadlock.
      const assets = ["/brain.glb", "/brain-custom.png", ...STORIES.map((story) => story.thumbnail)].filter(Boolean);
      let done = 0;
      const tick = () => {
        done += 1;
        if (!cancelled) setProgress(Math.round((done / assets.length) * 95));
      };
      await Promise.all(assets.map((src) => new Promise((resolve) => {
        if (src.endsWith(".glb")) {
          fetch(src).catch(() => null).finally(() => { tick(); resolve(); });
          return;
        }
        const image = new Image();
        image.onload = image.onerror = () => { tick(); resolve(); };
        image.src = src;
      })));
      finish();
    };

    waitForAssets();

    return () => {
      cancelled = true;
      window.removeEventListener("load", waitForAssets);
      document.body.style.overflow = "";
    };
  }, []);

  const handleVersion = (version) => {
    sessionStorage.setItem("gm-preloader-complete", "1");
    document.body.style.overflow = "";
    if (version === 2) router.push("/v2");
    else {
    
    // Animate out the preloader
    gsap.to(containerRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: "power4.inOut",
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
    }
  };

  const playHoverSound = () => {
    try {
      const audio = new Audio('/sounds/cta_in.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      console.log("Audio play failed:", e);
    }
  };

  const playHoverOutSound = () => {
    try {
      const audio = new Audio('/sounds/cta_out.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      console.log("Audio play failed:", e);
    }
  };

  if (skipped !== false) return null;

  return (
    <div ref={containerRef} className="preloader-wrapper">
      <div className="preloader-content">
        <div className="preloader-title">THE GREY MATTER</div>
        <div className="preloader-subtitle">
          {isLoaded ? "Ready" : `Loading ${String(progress).padStart(2, "0")}%`}
        </div>
      </div>
      
      <div 
        ref={buttonRef} 
        className={`siena-btn-w ${isLoaded ? 'is-visible' : ''}`}
        onClick={isLoaded ? () => handleVersion(1) : undefined}
        onMouseEnter={playHoverSound}
        onMouseLeave={playHoverOutSound}
        role="button"
        tabIndex={0}
      >
        <div className="siena-btn-col">
          <div className="siena-text-w">
            <span className="enter-text" data-after="VERSION 1">VERSION 1</span>
          </div>
        </div>
        <div className="siena-btn-col last">
          <div className="siena-text-w">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 10" className="enter-arrow">
              <path className="btn-arrow" fill="white" d="M4.481.005a6.65 6.65 0 0 1 6.46 4.659c.078.229.08.479-.003.706C10.302 7.105 8.318 10 4.48 10V8.39c.941.127 2.922-.257 4.442-2.603H0V4.208h8.938c-.756-1.229-2.216-2.78-4.457-2.78V.006Z"></path>
            </svg>
          </div>
        </div>
        <div className="abs siena-btn-bg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 142 44" width="100%">
            <path className="btn-shape" stroke="white" d="M5 1h90c0 1 .6 3 3 3s3-2 3-3h36c0 3.2 2.667 4.144 4 4.216V39c-3.2 0-4 2.667-4 4h-35c0-1.333-.8-4-4-4s-4 2.667-4 4H5c0-3.6-2.667-4.167-4-4V5c3.2 0 4-2.667 4-4Z" fill="transparent"></path>
            <path className="btn-dash" stroke="white" d="M98 4.5v34" strokeDasharray="4"></path>
          </svg>
        </div>
      </div>
      {isLoaded && (
        <button className="preloader-v2" type="button" onClick={() => handleVersion(2)}>
          VERSION 2
        </button>
      )}
    </div>
  );
}
