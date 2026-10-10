"use client";

import React, { useRef, useState, useEffect, forwardRef } from "react";

/**
 * Hook to calculate scroll progress for an element relative to the viewport
 * Implements the exact logic from Inspira UI / @vueuse/core
 */
export function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function updateMobile() {
      setIsMobile(window.innerWidth <= 768);
    }
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  useEffect(() => {
    let rafId = null;

    function handleScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Inspira UI formula: 1 - Math.max(0, rect.bottom - scrollY) / windowHeight
        // Normalized: progress from 0 (card enters viewport) to 1 (card centered/completed)
        const totalTravel = windowHeight + rect.height * 0.4;
        const currentDistance = windowHeight - rect.top;
        const rawProgress = Math.max(0, Math.min(1, currentDistance / totalTravel));

        setProgress(rawProgress);
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [ref]);

  return { progress, isMobile };
}

/**
 * ContainerScrollTitle (Inspira UI ContainerScrollTitle)
 */
export const ContainerScrollTitle = forwardRef(function ContainerScrollTitle(
  { translate = 0, children, className = "", style = {}, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        transform: `translateY(${translate}px)`,
        transition: "transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
        ...style,
      }}
      className={`container-scroll-title ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * ContainerScrollCard (Inspira UI ContainerScrollCard)
 */
export const ContainerScrollCard = forwardRef(function ContainerScrollCard(
  {
    rotate = 0,
    scale = 1,
    children,
    className = "",
    style = {},
    showDeviceFrame = true,
    ...props
  },
  ref
) {
  const cardStyles = showDeviceFrame
    ? {
        transform: `rotateX(${rotate}deg) scale(${scale})`,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
        transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
        ...style,
      }
    : {
        transform: `rotateX(${rotate}deg) scale(${scale})`,
        transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
        ...style,
      };

  return (
    <div
      ref={ref}
      style={cardStyles}
      className={`container-scroll-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * ContainerScroll (Inspira UI / Aceternity ContainerScroll)
 * Full 3D Scroll-driven Perspective Card Animation
 */
export const ContainerScroll = forwardRef(function ContainerScroll(
  {
    titleComponent,
    children,
    className = "",
    containerClassName = "",
    style = {},
    maxRotate = 20,
    ...props
  },
  forwardedRef
) {
  const internalRef = useRef(null);
  const containerRef = forwardedRef || internalRef;
  const { progress, isMobile } = useScrollProgress(containerRef);

  // Dimensions & transformations
  const scaleDimensions = isMobile ? [0.75, 0.95] : [1.05, 1.0];
  const rotate = maxRotate * (1 - progress);
  const scale = scaleDimensions[0] + (scaleDimensions[1] - scaleDimensions[0]) * progress;
  const translateY = -80 * progress;

  return (
    <div
      ref={containerRef}
      className={`container-scroll-wrap ${containerClassName}`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "12px 8px" : "32px 20px",
        ...style,
      }}
      {...props}
    >
      <div
        className={`container-scroll-inner ${className}`}
        style={{
          position: "relative",
          width: "100%",
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        {titleComponent && (
          <ContainerScrollTitle translate={translateY}>
            {titleComponent}
          </ContainerScrollTitle>
        )}

        <ContainerScrollCard rotate={rotate} scale={scale}>
          {children}
        </ContainerScrollCard>
      </div>
    </div>
  );
});

export default ContainerScroll;
