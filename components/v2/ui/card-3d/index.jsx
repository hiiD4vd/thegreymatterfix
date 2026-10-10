"use client";
import React, { createContext, useContext, useRef, useState, forwardRef, useEffect } from "react";
import gsap from "gsap";

const MouseContext = createContext({ isMouseEntered: false });

/* ─────────────────────────────────────────────
   CardContainer
   Full-surface 3D tilt tracking with GSAP
───────────────────────────────────────────── */
export const CardContainer = forwardRef(function CardContainer(
  { children, className = "", containerClass = "", style = {}, ...rest },
  forwardedRef
) {
  const internalRef = useRef(null);
  const containerRef = forwardedRef || internalRef;
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const rectRef = useRef(null);
  const rafRef = useRef(null);

  function handleMouseEnter() {
    setIsMouseEntered(true);
    if (containerRef.current) {
      rectRef.current = containerRef.current.getBoundingClientRect();
    }
  }

  function handleMouseMove(e) {
    if (rafRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = containerRef.current;
      if (!el) return;
      const rect = rectRef.current || el.getBoundingClientRect();
      const rawX = ((clientX - rect.left) - rect.width / 2) / 28;
      const rawY = ((clientY - rect.top) - rect.height / 2) / 28;

      const x = Math.max(-8, Math.min(8, rawX));
      const y = Math.max(-8, Math.min(8, rawY));

      gsap.to(el, {
        rotateY: x,
        rotateX: -y,
        transformPerspective: 1200,
        ease: "power2.out",
        duration: 0.35,
        overwrite: "auto",
      });
    });
  }

  function handleMouseLeave() {
    setIsMouseEntered(false);
    rectRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const el = containerRef.current;
    if (!el) return;
    gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      ease: "power3.out",
      duration: 0.5,
      overwrite: "auto",
    });
  }

  return (
    <MouseContext.Provider value={{ isMouseEntered }}>
      <div
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          ...style,
        }}
        className={`card-3d-perspective ${containerClass}`}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        <div
          ref={containerRef}
          style={{
            transformStyle: "preserve-3d",
          }}
          className={`card-3d-container ${className}`}
        >
          {children}
        </div>
      </div>
    </MouseContext.Provider>
  );
});

/* ─────────────────────────────────────────────
   CardBody
   Inner wrapper maintaining 3D context
───────────────────────────────────────────── */
export const CardBody = forwardRef(function CardBody(
  { children, className = "", style = {}, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={`card-3d-body ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});

/* ─────────────────────────────────────────────
   CardItem
   Individual 3D floating element with GSAP translateZ
───────────────────────────────────────────── */
export const CardItem = forwardRef(function CardItem(
  {
    as: Tag = "div",
    children,
    className = "",
    style = {},
    translateX = 0,
    translateY = 0,
    translateZ = 0,
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    ...rest
  },
  ref
) {
  const { isMouseEntered } = useContext(MouseContext);
  const internalRef = useRef(null);
  const itemRef = ref || internalRef;

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    if (isMouseEntered) {
      gsap.to(el, {
        x: translateX,
        y: translateY,
        z: translateZ,
        rotateX,
        rotateY,
        rotateZ,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(el, {
        x: 0,
        y: 0,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  return (
    <Tag
      ref={itemRef}
      className={`card-3d-item ${className}`}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
});