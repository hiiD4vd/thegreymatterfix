"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { STORIES } from "@/lib/stories";

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
      if (!cardRef.current || !imageWrapRef.current || !contentRef.current) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 768;
      
      const targetWidth = vw;
      const targetHeight = vh;
      const targetLeft = 0;
      const targetTop = 0;
      const targetRadius = isMobile ? 0 : 0;

      ctx = gsap.context(() => {
        // 1. Initial State: Exactly match the origin card rect
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

        gsap.set(imageWrapRef.current, {
          height: Math.min(220, originRect.height * 0.45),
        });

        gsap.set(contentRef.current, {
          opacity: 0,
          y: 25,
        });

        if (closeBtnRef.current) {
          gsap.set(closeBtnRef.current, {
            opacity: 0,
            scale: 0.8,
          });
        }

      // 2. Timeline to morph into full-screen expanded page
      const tl = gsap.timeline();

      // Backdrop fade in
      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      }, 0);

      // Card morphs to 100% full screen
      tl.to(cardRef.current, {
        top: targetTop,
        left: targetLeft,
        width: targetWidth,
        height: targetHeight,
        borderRadius: 0,
        duration: 0.95,
        ease: "power2.inOut",
      }, 0);

      // Image expands to cinematic hero banner
      tl.to(imageWrapRef.current, {
        height: "clamp(280px, 48vh, 520px)",
        duration: 0.95,
        ease: "power2.inOut",
      }, 0);

      // Controls fade & pop in
      tl.to(closeBtnRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: "power3.out",
      }, 0.45);

        // Narrative content gentle fade and slide in
        tl.to(contentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
        }, 0.4);
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

    const tl = gsap.timeline({
      onComplete: onClose,
    });

    // Fade out inner content smoothly
    tl.to([contentRef.current, closeBtnRef.current], {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
    }, 0);

    // Morph card back to exact origin rect gently
    tl.to(cardRef.current, {
      top: originRect.top,
      left: originRect.left,
      width: originRect.width,
      height: originRect.height,
      borderRadius: 22,
      duration: 0.8,
      ease: "power2.inOut",
    }, 0.05);

    // Shrink image back to thumbnail height
    tl.to(imageWrapRef.current, {
      height: Math.min(220, originRect.height * 0.45),
      duration: 0.8,
      ease: "power2.inOut",
    }, 0.05);

    // Fade out backdrop
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

  return createPortal(
    <>
      {/* Dark Ambient Backdrop */}
      <div
        ref={backdropRef}
        className="morph-card-backdrop"
        onClick={handleClose}
        style={{ opacity: 0 }}
      />

      {/* The Morphing Expanded Card */}
      <div
        ref={cardRef}
        className="morph-expanded-card"
        style={{ "--story-color": story.color }}
      >
        {/* Ambient Top Glow */}
        <div
          className="modal-ambient-glow"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${story.color}40, transparent 70%)`,
          }}
        />

        {/* Scrollable Container inside the Expanded Card */}
        <div className="morph-scroll-container">
          {/* Header Bar */}
          <div className="morph-header-bar">
            <button
              className="morph-back-btn"
              onClick={handleClose}
              aria-label="Back to map"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M12.667 8H3.333M8 12.667L3.333 8 8 3.333" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back to Map</span>
            </button>

            <div className="modal-tag">
              <span className="story-cat-dot" style={{ backgroundColor: story.color }} />
              <span>EPISODE {episodeNumber} · {story.category}</span>
            </div>

            <button
              ref={closeBtnRef}
              className="morph-close-btn-header"
              onClick={handleClose}
              aria-label="Close story"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Morphing Media Banner */}
          <div className="morph-media-frame" ref={imageWrapRef}>
            {story.videoUrl ? (
              <iframe
                src={story.videoUrl}
                title={story.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="modal-poster-wrap">
                {story.thumbnail ? (
                  <Image
                    src={story.thumbnail}
                    alt={story.title}
                    fill
                    sizes="(max-width: 940px) 100vw, 940px"
                    className="modal-poster-img"
                    priority
                  />
                ) : (
                  <div
                    className="modal-poster-fallback"
                    style={{
                      background: `linear-gradient(135deg, ${story.color}44, #080c18)`,
                    }}
                  />
                )}

                <div className="modal-play-overlay">
                  <div className="modal-play-pill">
                    <span className="modal-play-icon" style={{ borderColor: story.color }}>
                      <svg viewBox="0 0 10 10" width="14" height="14" fill="white">
                        <path d="M1 0.5 9 5 1 9.5z" />
                      </svg>
                    </span>
                    <span>Watch Full Film</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Unfolding Content Details */}
          <div className="morph-content-body" ref={contentRef}>
            <div className="modal-title-area">
              <h2 className="modal-story-title">{story.title}</h2>
              <p className="modal-story-lede">{story.blurb}</p>
            </div>

            <div className="modal-narrative-section">
              <h3 className="modal-section-title">What Happens in the Brain</h3>
              <p className="modal-narrative-text">{story.description}</p>

              <div className="modal-insights-row">
                <div className="modal-insight-card">
                  <span className="insight-tag">Neural Target</span>
                  <strong className="insight-heading">Dopaminergic Pathway</strong>
                  <p className="insight-details">VTA to Nucleus Accumbens circuit stimulation.</p>
                </div>

                <div className="modal-insight-card">
                  <span className="insight-tag">Biochemical Shift</span>
                  <strong className="insight-heading" style={{ color: story.color }}>
                    Receptor Downregulation
                  </strong>
                  <p className="insight-details">Tolerance elevation requiring higher stimulus intensity.</p>
                </div>

                <div className="modal-insight-card">
                  <span className="insight-tag">Recovery Window</span>
                  <strong className="insight-heading">Neuroplastic Rewiring</strong>
                  <p className="insight-details">Synaptic adaptation upon sustained stimulus removal.</p>
                </div>
              </div>
            </div>

            {/* Bottom Episode Navigation */}
            <div className="modal-bottom-nav">
              <button
                className="modal-nav-btn modal-nav-prev"
                onClick={() => onSelectStory(prev, null)}
              >
                <span className="btn-dir">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M12.667 8H3.333M8 12.667L3.333 8 8 3.333" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Previous
                </span>
                <span className="btn-category">{prev.category}</span>
              </button>

              <button
                className="modal-nav-btn modal-nav-next"
                onClick={() => onSelectStory(next, null)}
              >
                <span className="btn-dir">
                  Next
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="btn-category">{next.category}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
