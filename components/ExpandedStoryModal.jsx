"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { STORIES } from "@/lib/stories";

export default function ExpandedStoryModal({ story, onClose, onSelectStory }) {
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    // GSAP Cinematic Entrance Timeline
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.45, ease: "power2.out" }
      );

      tl.fromTo(
        cardRef.current,
        {
          opacity: 0,
          scale: 0.86,
          y: 45,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          ease: "power4.out",
        },
        "-=0.35"
      );

      tl.fromTo(
        mediaRef.current,
        {
          scale: 0.94,
          opacity: 0.6,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.65,
          ease: "power3.out",
        },
        "-=0.55"
      );

      if (contentRef.current) {
        tl.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power3.out",
          },
          "-=0.45"
        );
      }
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      ctx.revert();
    };
  }, [story?.id]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(cardRef.current, {
      opacity: 0,
      scale: 0.9,
      y: 30,
      duration: 0.38,
      ease: "power3.inOut",
    });

    tl.to(
      backdropRef.current,
      {
        opacity: 0,
        duration: 0.35,
        ease: "power2.inOut",
      },
      "-=0.25"
    );
  };

  if (!story) return null;

  const idx = STORIES.findIndex((s) => s.id === story.id);
  const prev = STORIES[(idx - 1 + STORIES.length) % STORIES.length];
  const next = STORIES[(idx + 1) % STORIES.length];
  const episodeNumber = String(Math.max(idx + 1, 1)).padStart(2, "0");

  return (
    <div
      ref={backdropRef}
      className="expanded-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={cardRef}
        className="expanded-modal-card"
        style={{ "--story-color": story.color }}
      >
        {/* Ambient Glow */}
        <div
          className="modal-ambient-glow"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${story.color}35, transparent 70%)`,
          }}
        />

        {/* Modal Top Header Bar */}
        <div className="modal-header-bar">
          <div className="modal-tag">
            <span className="story-cat-dot" style={{ backgroundColor: story.color }} />
            <span>EPISODE {episodeNumber} · {story.category}</span>
          </div>

          <button
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close expanded card"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Card Body */}
        <div className="modal-scroll-body" ref={contentRef}>
          {/* Title & Blurb */}
          <div className="modal-title-area">
            <h2 className="modal-story-title">{story.title}</h2>
            <p className="modal-story-lede">{story.blurb}</p>
          </div>

          {/* Media Player Frame */}
          <div className="modal-media-frame" ref={mediaRef}>
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
                    width={1100}
                    height={620}
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

          {/* Neuroscience Breakdown Section */}
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

          {/* Modal Bottom Switcher */}
          <div className="modal-bottom-nav">
            <button
              className="modal-nav-btn modal-nav-prev"
              onClick={() => onSelectStory(prev)}
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
              onClick={() => onSelectStory(next)}
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
  );
}

