"use client";
import { useEffect, useRef } from "react";
import { use } from "react";
import { STORIES } from "@/lib/stories";
import Link from "next/link";
import Image from "next/image";

export default function StoryPage({ params }) {
  const { id } = use(params);
  const pageRef = useRef(null);

  const idx = STORIES.findIndex((s) => s.id === id);
  const story = idx >= 0 ? STORIES[idx] : STORIES[0];
  const prev = STORIES[(idx - 1 + STORIES.length) % STORIES.length];
  const next = STORIES[(idx + 1) % STORIES.length];

  const episodeNumber = String(Math.max(idx + 1, 1)).padStart(2, "0");

  useEffect(() => {
    // Clean up any lingering overlay from previous page
    document.querySelectorAll(".zoom-overlay").forEach((el) => el.remove());
    document.body.classList.remove("transitioning");

    requestAnimationFrame(() => {
      if (pageRef.current) pageRef.current.classList.add("ready");
    });
  }, [id]);

  return (
    <div className="story-page-container" ref={pageRef} style={{ "--story-color": story.color }}>
      {/* Top Header Navigation */}
      <header className="story-topbar">
        <Link className="story-back-btn" href="/">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M12.667 8H3.333M8 12.667L3.333 8 8 3.333"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to Map</span>
        </Link>

        <div className="story-meta-badge">
          <span className="story-meta-dot" style={{ backgroundColor: story.color }} />
          <span>EPISODE {episodeNumber} / {String(STORIES.length).padStart(2, "0")}</span>
        </div>

        <span className="story-brand">The Grey Matter</span>
      </header>

      {/* Main Expanded Cinematic Card */}
      <main className="story-main">
        <article className="story-expanded-card">
          {/* Ambient Glow behind the card */}
          <div
            className="story-ambient-glow"
            style={{
              background: `radial-gradient(ellipse at 50% 20%, ${story.color}33, transparent 70%)`,
            }}
          />

          {/* Card Header */}
          <div className="story-detail-header">
            <div className="story-detail-tag">
              <span className="story-cat-dot" style={{ backgroundColor: story.color }} />
              <span>{story.category}</span>
            </div>

            <h1 className="story-detail-title">{story.title}</h1>
            <p className="story-detail-lede">{story.blurb}</p>
          </div>

          {/* Giant Expanded Media Frame */}
          <div className="story-media-player-wrap">
            <div className="story-media-player">
              {story.videoUrl ? (
                <iframe
                  src={story.videoUrl}
                  title={story.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="story-media-poster">
                  {story.thumbnail ? (
                    <Image
                      src={story.thumbnail}
                      alt={story.title}
                      width={1200}
                      height={675}
                      className="story-poster-img"
                      priority
                    />
                  ) : (
                    <div
                      className="story-poster-fallback"
                      style={{
                        background: `linear-gradient(145deg, ${story.color}44, #080c18)`,
                      }}
                    />
                  )}

                  {/* High-end cinematic video overlay */}
                  <div className="story-poster-overlay">
                    <div className="story-play-pill">
                      <span className="story-play-icon" style={{ borderColor: story.color }}>
                        <svg viewBox="0 0 10 10" width="14" height="14" fill="white">
                          <path d="M1 0.5 9 5 1 9.5z" />
                        </svg>
                      </span>
                      <span className="story-play-label">Watch Full Episode (4K)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Story Narrative & Insights */}
          <div className="story-detail-body">
            <div className="story-narrative">
              <h2 className="story-section-title">What Happens In The Brain</h2>
              <p className="story-text-primary">{story.description}</p>
            </div>

            {/* Neuroscience Highlights Grid */}
            <div className="story-insights-grid">
              <div className="story-insight-box">
                <span className="insight-label">Primary Circuit</span>
                <strong className="insight-value">Mesolimbic Pathway</strong>
                <p className="insight-desc">Ventral tegmental area to nucleus accumbens.</p>
              </div>

              <div className="story-insight-box">
                <span className="insight-label">Neurochemical</span>
                <strong className="insight-value" style={{ color: story.color }}>
                  Dopamine & Cortisol
                </strong>
                <p className="insight-desc">Alters receptor density and reward sensitivity.</p>
              </div>

              <div className="story-insight-box">
                <span className="insight-label">Neural Impact</span>
                <strong className="insight-value">Neuroplastic Adaptation</strong>
                <p className="insight-desc">Synaptic pruning and tolerance shift over time.</p>
              </div>
            </div>
          </div>

          {/* Navigation Bar (Prev & Next Episode Cards) */}
          <nav className="story-bottom-nav">
            <Link
              href={`/story/${encodeURIComponent(prev.id)}`}
              className="story-nav-card story-nav-prev"
            >
              <span className="nav-dir">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M12.667 8H3.333M8 12.667L3.333 8 8 3.333" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Previous Episode
              </span>
              <strong className="nav-title">{prev.category}</strong>
              <span className="nav-sub">{prev.title}</span>
            </Link>

            <Link
              href={`/story/${encodeURIComponent(next.id)}`}
              className="story-nav-card story-nav-next"
            >
              <span className="nav-dir">
                Next Episode
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <strong className="nav-title">{next.category}</strong>
              <span className="nav-sub">{next.title}</span>
            </Link>
          </nav>
        </article>
      </main>

      <footer className="site-footer">
        The Grey Matter — a short-film series exploring the everyday brain.
      </footer>
    </div>
  );
}