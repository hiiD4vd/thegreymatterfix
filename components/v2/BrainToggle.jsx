"use client";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";

export default function BrainToggle() {
  const [particleMode, setParticleMode] = useState(false);
  const containerRef = useRef(null);
  const destroyRef = useRef(null);

  const handleToggle = async () => {
    if (!particleMode) {
      setParticleMode(true);
      // Lazy-load the particle brain only on client, no SSR
      const { initParticleBrain } = await import("../lib/brain-particle.js");
      if (containerRef.current) {
        destroyRef.current = initParticleBrain(containerRef.current);
      }
    } else {
      if (destroyRef.current) {
        destroyRef.current();
        destroyRef.current = null;
      }
      setParticleMode(false);
    }
  };

  return (
    <>
      <button
        id="brain-toggle"
        className="brain-toggle-btn"
        onClick={handleToggle}
        aria-label="Toggle brain view mode"
      >
        {!particleMode ? (
          <svg id="toggle-icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="12" rx="4" ry="4"/>
            <path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9"/>
          </svg>
        ) : (
          <svg id="toggle-icon-particle" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
        )}
        <span id="toggle-label">{particleMode ? "SVG Brain" : "3D Particle"}</span>
      </button>

      <div
        ref={containerRef}
        id="brain-particle-container"
        style={{ display: particleMode ? "block" : "none", width: 280, height: 280 }}
      />
    </>
  );
}
