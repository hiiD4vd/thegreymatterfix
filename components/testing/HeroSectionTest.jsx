"use client";

export default function HeroSectionTest({
  accentColor = "var(--signal)",
  eyebrowColor = "var(--signal)",
  title = "THE GREY",
  accentText = "Matter",
  subtext = "Little stories about your brain, and the things that shape it.",
}) {
  return (
    <section className="hero">
      <div className="hero-inner-wrap">
        <span
          className="hero-eyebrow"
          style={{ color: eyebrowColor }}
        >
          A series of short films
        </span>

        <div className="lockup-nestled">
          <h1 className="nestled-main">{title}</h1>
          <span
            className="nestled-accent"
            style={{
              color: accentColor,
              textShadow: `0 4px 24px ${accentColor}66`,
            }}
          >
            {accentText}
          </span>
        </div>

        <p className="hero-lede">{subtext}</p>
      </div>

      <div className="scroll-cue">
        <span>Scroll to explore</span>
        <svg width="8" height="11" viewBox="0 0 14 20" fill="none">
          <rect x="1" y="1" width="12" height="18" rx="6" stroke="currentColor" />
          <circle cx="7" cy="6" r="1.6" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
