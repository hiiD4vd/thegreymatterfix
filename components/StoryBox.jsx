"use client";
import { useRef } from "react";
import Image from "next/image";

export default function StoryBox({ story, onBoxRef, onSelect }) {
  const cardRef = useRef(null);

  const handleCardClick = (e) => {
    if (onSelect) {
      const rect = cardRef.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
      onSelect(story, rect);
    }
  };

  const setBoxRefs = (el) => {
    cardRef.current = el;
    if (onBoxRef) onBoxRef(el);
  };

  return (
    <div className="story-card-wrapper">
      <div
        className="story-box in-view"
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
          <div className="story-card-header">
            <div className="story-card-category-tag">
              <span className="story-cat-dot" style={{ backgroundColor: story.color }} />
              <span>{story.category}</span>
            </div>
            <h3 className="story-card-title">{story.title}</h3>
            <p className="story-card-blurb">{story.lede || story.blurb}</p>
          </div>
          {story.image && (
            <div className="story-card-image-wrap">
              <Image
                src={story.image}
                alt={story.title}
                width={360}
                height={200}
                className="story-card-image"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
