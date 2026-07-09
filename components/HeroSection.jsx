"use client";

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-inner-wrap">
        <span className="hero-eyebrow">A series of short films</span>

        <div className="lockup-nestled">
          <h1 className="nestled-main">THE GREY</h1>
          <span className="nestled-accent">Matter</span>
        </div>

        <p className="hero-lede">
          Little stories about your brain, and the things that shape it.
        </p>
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
