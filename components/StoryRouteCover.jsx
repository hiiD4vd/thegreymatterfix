"use client";

import { useEffect, useState } from "react";

// Root-level shared cover survives Next client route changes.
export default function StoryRouteCover() {
  const [cover, setCover] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const start = (event) => {
      setFading(false);
      setExpanded(false);
      setCover(event.detail);
      requestAnimationFrame(() => requestAnimationFrame(() => setExpanded(true)));
    };
    const finish = () => {
      setFading(true);
      window.setTimeout(() => setCover(null), 360);
    };
    window.addEventListener("gm-story-transition-start", start);
    window.addEventListener("gm-story-transition-ready", finish);
    return () => {
      window.removeEventListener("gm-story-transition-start", start);
      window.removeEventListener("gm-story-transition-ready", finish);
    };
  }, []);

  if (!cover) return null;
  const { image, rect } = cover;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", zIndex: 100000, pointerEvents: "none",
        left: expanded ? 0 : rect.left,
        top: expanded ? 0 : rect.top,
        width: expanded ? "100vw" : rect.width,
        height: expanded ? "100dvh" : rect.height,
        borderRadius: expanded ? 0 : 18,
        opacity: fading ? 0 : 1,
        background: `url("${image}") center / cover no-repeat`,
        transition: "left 520ms cubic-bezier(.2,.8,.2,1), top 520ms cubic-bezier(.2,.8,.2,1), width 520ms cubic-bezier(.2,.8,.2,1), height 520ms cubic-bezier(.2,.8,.2,1), border-radius 520ms cubic-bezier(.2,.8,.2,1), opacity 360ms ease-out",
      }}
    />
  );
}
