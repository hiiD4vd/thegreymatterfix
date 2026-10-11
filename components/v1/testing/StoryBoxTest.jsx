"use client";
import { useRef } from "react";
import Image from "next/image";
import { CardContainer, CardBody, CardItem } from "@/components/v1/ui/card-3d";

export default function StoryBoxTest({
  story,
  onBoxRef,
  onSelect,
  cardStyle = "narupa", // "narupa" | "vibrant" | "tinted" | "default"
  buttonStyle = "solid", // "solid" | "glow" | "subtle"
  rimLight = true,
  cardOpacity = 0.96,
}) {
  const cardBodyRef = useRef(null);

  const handleCardClick = (e) => {
    if (onSelect) {
      const rect =
        cardBodyRef.current?.getBoundingClientRect() ||
        e.currentTarget.getBoundingClientRect();
      onSelect(story, rect);
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      const rect =
        cardBodyRef.current?.getBoundingClientRect() ||
        e.currentTarget.closest(".story-box")?.getBoundingClientRect() ||
        e.currentTarget.getBoundingClientRect();
      onSelect(story, rect);
    }
  };

  const setBoxRefs = (el) => {
    cardBodyRef.current = el;
    if (onBoxRef) onBoxRef(el);
  };

  const color = story.color || "#ffd166";

  // Dynamic Card Background & Borders based on selected testing style
  let cardBgStyle = {};
  let categoryBadgeStyle = {};
  let buttonStyleObj = {};
  let playBtnStyle = {};

  if (cardStyle === "narupa") {
    // 🎨 GAYA NARUPA: Hangat, bertekstur, terracotta/matcha/amber tinted, buttery rim highlight
    cardBgStyle = {
      background: `linear-gradient(160deg, ${color}28 0%, rgba(24, 20, 26, ${cardOpacity}) 45%, rgba(14, 12, 18, 0.98) 100%)`,
      border: `1.5px solid ${color}55`,
      boxShadow: rimLight
        ? `inset 0 1.5px 0 rgba(255, 247, 223, 0.55), 0 20px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px -5px ${color}35`
        : `0 20px 50px -12px rgba(0, 0, 0, 0.85), 0 0 25px -5px ${color}30`,
    };

    categoryBadgeStyle = {
      background: `${color}28`,
      border: `1px solid ${color}77`,
      color: "#ffffff",
      textShadow: `0 1px 8px ${color}88`,
    };

    buttonStyleObj = {
      background: `linear-gradient(135deg, ${color}, ${color}dd)`,
      color: "#ffffff",
      border: "none",
      boxShadow: `0 4px 18px ${color}66`,
      fontWeight: 600,
    };

    playBtnStyle = {
      background: color,
      borderColor: "#FFF7DF",
      boxShadow: `0 0 22px ${color}99`,
    };
  } else if (cardStyle === "vibrant") {
    // 🌈 GAYA VIBRANT NEON: Sangat colorful dan mencolok dengan saturasi tinggi
    cardBgStyle = {
      background: `linear-gradient(150deg, ${color}38 0%, rgba(16, 22, 38, ${cardOpacity}) 50%, rgba(8, 12, 22, 0.98) 100%)`,
      border: `2px solid ${color}88`,
      boxShadow: `0 24px 60px -10px rgba(0, 0, 0, 0.9), 0 0 45px 0px ${color}45, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
    };

    categoryBadgeStyle = {
      background: color,
      color: "#080c18",
      border: "none",
      fontWeight: 700,
    };

    buttonStyleObj = {
      background: color,
      color: "#080c18",
      border: "none",
      fontWeight: 700,
      boxShadow: `0 4px 20px ${color}88`,
    };

    playBtnStyle = {
      background: color,
      borderColor: "#ffffff",
      boxShadow: `0 0 25px ${color}`,
    };
  } else if (cardStyle === "tinted") {
    // 💡 GAYA TINTED GLOW: Gelap tapi bercahaya lembut dengan aksen warna cerita
    cardBgStyle = {
      background: `linear-gradient(180deg, ${color}18 0%, #0a0e1c 55%, #060914 100%)`,
      border: `1px solid ${color}44`,
      boxShadow: `0 16px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px -8px ${color}30`,
    };

    categoryBadgeStyle = {
      background: `${color}1f`,
      border: `1px solid ${color}44`,
      color: color,
    };

    buttonStyleObj = {
      background: `${color}22`,
      color: color,
      border: `1px solid ${color}55`,
    };

    playBtnStyle = {
      borderColor: color,
      background: "rgba(0,0,0,0.5)",
    };
  } else {
    // 🌑 GAYA DEFAULT (ORIGINAL): Hitam pekat obsidian
    cardBgStyle = {
      background: "#080c18",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    };

    categoryBadgeStyle = {};
    buttonStyleObj = {};
    playBtnStyle = { borderColor: color };
  }

  // Button style overrides if specified
  if (buttonStyle === "glow") {
    buttonStyleObj = {
      background: `${color}25`,
      color: color,
      border: `1.5px solid ${color}`,
      boxShadow: `0 0 16px ${color}55`,
      fontWeight: 600,
    };
  } else if (buttonStyle === "subtle") {
    buttonStyleObj = {
      background: "rgba(255, 255, 255, 0.08)",
      color: "var(--ink)",
      border: "1px solid rgba(255, 255, 255, 0.14)",
    };
  }

  return (
    <CardContainer containerClass="story-card-wrapper" className="story-card-3d-wrap">
      <CardBody
        className="story-box story-card-3d-body in-view"
        style={{
          "--box-color": color,
          ...cardBgStyle,
        }}
        ref={setBoxRefs}
      >
        {/* Ambient Top Glow Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "55%",
            background: `radial-gradient(ellipse at 50% 0%, ${color}35 0%, transparent 75%)`,
            pointerEvents: "none",
            borderRadius: "24px 24px 0 0",
          }}
          aria-hidden="true"
        />

        <div
          className="story-card-inner"
          data-story-id={story.id}
          aria-label={`${story.category}: ${story.title}`}
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (onSelect) onSelect(story);
            }
          }}
        >
          {/* Header Section: Title & Blurb */}
          <div className="story-card-header">
            <CardItem
              translateZ={12}
              className="story-card-category-tag"
              style={categoryBadgeStyle}
            >
              <span className="story-cat-dot" style={{ backgroundColor: color }} />
              <span>{story.category}</span>
            </CardItem>

            <CardItem translateZ={20} as="h3" className="story-card-title">
              {story.title}
            </CardItem>

            <CardItem translateZ={12} as="p" className="story-card-blurb">
              {story.blurb}
            </CardItem>
          </div>

          {/* Media Section: Floating 3D Image */}
          <CardItem translateZ={38} className="story-card-media-wrap">
            <div
              className="story-card-media"
              onClick={handleButtonClick}
              style={{
                borderRadius: 16,
                border: rimLight ? `1px solid rgba(255, 247, 223, 0.35)` : `1px solid ${color}44`,
                boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 20px -3px ${color}25`,
              }}
            >
              {story.thumbnail ? (
                <Image
                  src={story.thumbnail}
                  alt={story.title}
                  width={540}
                  height={300}
                  className="story-card-img"
                  priority={false}
                />
              ) : (
                <div
                  className="story-card-img-placeholder"
                  style={{
                    background: `linear-gradient(135deg, ${color}55, #080c18)`,
                  }}
                />
              )}
              {/* Play button hover badge */}
              <div className="story-card-play-overlay">
                <span className="story-card-play-icon" style={playBtnStyle}>
                  <svg viewBox="0 0 10 10" width="12" height="12" fill={cardStyle === "vibrant" || cardStyle === "narupa" ? "white" : "white"}>
                    <path d="M1 0.5 9 5 1 9.5z" />
                  </svg>
                </span>
              </div>
            </div>
          </CardItem>

          {/* Footer Section: Action Row */}
          <div className="story-card-footer">
            <CardItem
              translateZ={14}
              className="story-card-link-text"
              style={{ color: color }}
            >
              <span>Watch</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.333 8h9.334M8.667 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardItem>

            <CardItem translateZ={24} className="story-card-btn-wrap">
              <button
                type="button"
                className="story-card-pill-btn"
                style={buttonStyleObj}
                onClick={handleButtonClick}
                aria-label={`Open ${story.title}`}
              >
                Get Started
              </button>
            </CardItem>
          </div>
        </div>
      </CardBody>
    </CardContainer>
  );
}
