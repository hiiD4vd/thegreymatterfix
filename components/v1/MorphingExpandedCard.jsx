"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import gsap from "gsap";
import { STORIES } from "@/lib/v1/stories";
import { renderSienaHtml } from "@/lib/v1/sienaRender";

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

    // Siena detail must behave like the original page: fixed viewport + its own
    // long scroll. Do not morph from card size; that made the container stretch
    // to full content height and killed scrolling.
    gsap.set(backdropRef.current, { opacity: 1 });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
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

  // Template Siena diisi data The Grey Matter (layout & CSS tidak diubah).
  const { html: finalHtml, next: nextStory, prev: prevStory } = renderSienaHtml(story);

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
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          maxHeight: "100vh",
          zIndex: 99999,
          borderRadius: 0,
          background: "#fff",
          overflowY: "auto",
          overflowX: "hidden",
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
