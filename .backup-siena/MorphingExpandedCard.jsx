"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import gsap from "gsap";
import { STORIES } from "@/lib/stories";
import { SIENA_RAW_HTML } from "./SienaTemplate";

export default function MorphingExpandedCard({ story, originRect, onClose, onSelectStory }) {
  const [mounted, setMounted] = useState(() => typeof window !== "undefined");
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const imageWrapRef = useRef(null);
  const contentRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!story || !originRect) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    let ctx;
    const rafId = requestAnimationFrame(() => {
      if (!cardRef.current) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      ctx = gsap.context(() => {
        gsap.set(cardRef.current, {
          position: "fixed",
          top: originRect.top,
          left: originRect.left,
          width: originRect.width,
          height: originRect.height,
          borderRadius: 22,
          zIndex: 99999,
          overflow: "hidden",
        });

        const tl = gsap.timeline();

        tl.to(backdropRef.current, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        }, 0);

        tl.to(cardRef.current, {
          top: 0,
          left: 0,
          width: vw,
          height: vh,
          borderRadius: 0,
          duration: 0.95,
          ease: "power2.inOut",
          onComplete: () => {
            if (cardRef.current) {
              cardRef.current.style.overflowY = "auto";
              cardRef.current.style.overflowX = "hidden";
            }
          }
        }, 0);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (ctx) ctx.revert();
    };
  }, [story?.id, originRect]);

  const handleClose = () => {
    if (!originRect) {
      onClose();
      return;
    }

    if (cardRef.current) {
      cardRef.current.style.overflow = "hidden";
    }
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(cardRef.current, {
      top: originRect.top,
      left: originRect.left,
      width: originRect.width,
      height: originRect.height,
      borderRadius: 22,
      duration: 0.8,
      ease: "power2.inOut",
    }, 0.05);

    tl.to(backdropRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
    }, 0.15);
  };

  if (!mounted || !story) return null;

  const idx = STORIES.findIndex((s) => s.id === story.id);
  const prev = STORIES[(idx - 1 + STORIES.length) % STORIES.length];
  const next = STORIES[(idx + 1) % STORIES.length];
  const episodeNumber = String(Math.max(idx + 1, 1)).padStart(2, "0");

  let finalHtml = SIENA_RAW_HTML
    .replace(/\{\{STORY_TITLE\}\}/g, story.title || 'My Project X')
    .replace(/\{\{STORY_TITLE_UPPER\}\}/g, (story.title || 'MY PROJECT X').toUpperCase())
    .replace(/\{\{STORY_CATEGORY\}\}/g, story.category || 'Documentary')
    .replace(/\{\{STORY_CATEGORY_UPPER\}\}/g, (story.category || 'DOCUMENTARY').toUpperCase())
    .replace(/\{\{STORY_THUMBNAIL\}\}/g, story.thumbnail || 'https://cdn.prod.website-files.com/673306db3b111afa559bc378/67923c1fa550c616a38131b9_project.jpg')
    .replace(/\{\{STORY_VIDEO\}\}/g, story.videoUrl ? `<iframe src="${story.videoUrl}" style="width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>` : '');

  // Wrap the exact Siena DOM inside the morphing card
  return createPortal(
    <>
            <link rel="stylesheet" href="/siena-work-space.css" />
      <link rel="stylesheet" href="/siena-out.css" />
      <link rel="stylesheet" href="/siena-webflow.css" />
      
      
      
      <div
        ref={backdropRef}
        className="morph-card-backdrop siena-bg"
        onClick={handleClose}
        style={{ opacity: 0, background: '#000' }}
      />

      <div
        ref={cardRef}
        className="morph-expanded-card siena-card"
        style={{ 
          "--story-color": story.color, 
          background: "#fff", 
          overflowY: "auto", 
          overflowX: "hidden" 
        }}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: finalHtml }}
          className="w-mod-js w-mod-ix"
          style={{ width: "100%" }}
        />

        {/* Floating Close Button for convenience */}
        <button
          className="morph-back-btn"
          onClick={handleClose}
          style={{
            position: 'fixed',
            top: 30,
            left: 30,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{display:'inline', marginRight: 8, verticalAlign:'middle'}}>
            <path d="M12.667 8H3.333M8 12.667L3.333 8 8 3.333" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{verticalAlign:'middle'}}>Back to Map</span>
        </button>
      </div>
    </>,
    document.body
  );
}
