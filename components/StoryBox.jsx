"use client";
import { useRef } from "react";
import Image from "next/image";
import { CardContainer, CardBody, CardItem } from "@/components/ui/card-3d";

export default function StoryBox({ story, onBoxRef, onSelect }) {
  const cardBodyRef = useRef(null);

  const handleCardClick = (e) => {
    if (onSelect) {
      const rect = cardBodyRef.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
      onSelect(story, rect);
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      const rect = cardBodyRef.current?.getBoundingClientRect() || e.currentTarget.closest(".story-box")?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
      onSelect(story, rect);
    }
  };

  const setBoxRefs = (el) => {
    cardBodyRef.current = el;
    if (onBoxRef) onBoxRef(el);
  };

  return (
    <CardContainer containerClass="story-card-wrapper" className="story-card-3d-wrap">
      <CardBody
        className="story-box story-card-3d-body in-view"
        style={{ "--box-color": story.color }}
        ref={setBoxRefs}
      >
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
            >
              <span className="story-cat-dot" style={{ backgroundColor: story.color }} />
              <span>{story.category}</span>
            </CardItem>

            <CardItem
              translateZ={20}
              as="h3"
              className="story-card-title"
            >
              {story.title}
            </CardItem>

            <CardItem
              translateZ={12}
              as="p"
              className="story-card-blurb"
            >
              {story.blurb}
            </CardItem>
          </div>

          {/* Media Section: Floating 3D Image */}
          <CardItem
            translateZ={38}
            className="story-card-media-wrap"
          >
            <div
              className="story-card-media"
              onClick={handleButtonClick}
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
                    background: `linear-gradient(135deg, ${story.color}44, #080c18)`,
                  }}
                />
              )}
              {/* Play button hover badge */}
              <div className="story-card-play-overlay">
                <span className="story-card-play-icon" style={{ borderColor: story.color }}>
                  <svg viewBox="0 0 10 10" width="12" height="12" fill="white">
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

            <CardItem
              translateZ={24}
              className="story-card-btn-wrap"
            >
              <button
                type="button"
                className="story-card-pill-btn"
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