"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { STORIES } from "@/lib/stories";

export default function ExpandedStoryModal({ story, onClose, onSelectStory }) {
  const backdropRef = useRef(null);
  const heroImgRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Entrance animation perfectly mimicking a full-screen transition
      tl.to(backdropRef.current, {
        autoAlpha: 1,
        duration: 0.6,
        ease: "power3.out"
      });

      tl.fromTo(heroImgRef.current, 
        { scale: 1.2, y: 50 },
        { scale: 1, y: 0, duration: 1.2, ease: "power3.out" },
        "-=0.4"
      );

      tl.fromTo(titleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.8"
      );
      
      tl.fromTo(contentRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      );
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      ctx.revert();
    };
  }, [story?.id]);

  const handleClose = () => {
    gsap.to(backdropRef.current, {
      autoAlpha: 0,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: onClose
    });
  };

  if (!story) return null;

  return (
    <div ref={backdropRef} className="siena-detail-backdrop">
      <div className="siena-detail-wrapper">
        
        {/* Back Button Overlay */}
        <button className="siena-back-btn" onClick={handleClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100">
            <path fill="currentColor" d="M69.022 85.363c16.693-13.32 20.658-33.261 20.16-43.736H77.95c0 17.454-11.106 29.106-20.543 35.517-4.676 3.177-10.818 2.998-15.414-.293-17.124-12.264-19.958-27.753-18.988-35.224H10.305c0 20.438 9.697 34.444 20.244 43.16 11.033 9.118 27.285 9.503 38.473.576Z"></path>
            <path fill="currentColor" fillRule="evenodd" d="M56.016 5v79.243H43.56V5h12.455Z" clipRule="evenodd"></path>
          </svg>
          All Stories
        </button>

        {/* Hero Section */}
        <div className="siena-hero">
          <Image
            ref={heroImgRef}
            src={story.thumbnail || "/hero/brain.jpg"}
            alt={story.title}
            fill
            className="siena-hero-img"
            priority
          />
        </div>

        {/* Text Block */}
        <div className="siena-text-hero" ref={titleRef}>
          <div className="siena-eyebrow">{story.category}</div>
          <h1 className="siena-huge-title">{story.title}</h1>
          <div className="siena-lines">
            <div className="siena-line"></div>
            <div className="siena-line" style={{ width: "80%" }}></div>
            <div className="siena-line" style={{ width: "60%", opacity: 0 }}></div>
          </div>
        </div>

        {/* Video & Description */}
        <div ref={contentRef}>
          <div className="siena-video-w">
            <div className="siena-video-inner">
              {story.videoUrl ? (
                <iframe
                  src={story.videoUrl}
                  title={story.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div style={{width: "100%", height: "100%", background: "black"}} />
              )}
            </div>
          </div>

          <div className="siena-narrative-section">
            <h3 className="siena-narrative-title">Synopsis</h3>
            <p className="siena-narrative-text">{story.description}</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
