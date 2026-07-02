"use client";
import { useEffect, useRef, useState } from "react";
import { STORIES, CARD_MAP } from "@/lib/stories";
import BrainHub from "./BrainHub";
import MorphingExpandedCard from "./MorphingExpandedCard";

function PaperCard({ story, onBoxRef, onSelect }) {
  const boxRef = useRef(null);
  const cat = story.category.toLowerCase().trim();
  const src = CARD_MAP[cat];

  const handleClick = (e) => {
    e.preventDefault();
    if (onSelect && boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      onSelect(story, rect);
    }
  };

  const handleMouseMove = (e) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    const rx = -dy * 14; const ry = dx * 14;
    box.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(20px) scale(1.03)`;
    const sheen = box.querySelector(".pc-sheen");
    if (sheen) sheen.style.background = `radial-gradient(circle at ${50 + dx * 38}% ${50 + dy * 38}%, rgba(255,255,255,0.28), transparent 62%)`;
  };

  const handleMouseLeave = () => {
    const box = boxRef.current;
    if (!box) return;
    box.style.transition = "transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease";
    box.style.transform = "";
    const sheen = box.querySelector(".pc-sheen");
    if (sheen) sheen.style.background = "";
    setTimeout(() => { if (box) box.style.transition = ""; }, 600);
  };

  const handleMouseEnter = () => {
    const box = boxRef.current;
    if (box) box.style.transition = "transform 0.15s ease, box-shadow 0.3s ease";
  };

  const setRef = (el) => {
    boxRef.current = el;
    if (onBoxRef) onBoxRef(el);
  };

  return (
    <a
      href={`/story/${encodeURIComponent(story.id)}`}
      className="story-box paper-card-style"
      style={{ "--box-color": story.color }}
      data-story-id={story.id}
      aria-label={`${story.category}: ${story.title}`}
      ref={setRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div className="pc-inner">
        {src && <img src={src} alt={cat} className="pc-img" draggable={false} />}
        <div className="pc-sheen"></div>
        <span className="pc-badge">{cat}</span>
        <div
          className="pc-glow"
          style={{ boxShadow: `0 0 40px 6px ${story.color}44 inset` }}
        />
      </div>
    </a>
  );
}

export default function PaperCards() {
  const [activeSelection, setActiveSelection] = useState(null); // { story, originRect }
  const boxRefs = useRef([]);
  const networkRef = useRef(null);

  useEffect(() => {
    const boxes = boxRefs.current.filter(Boolean);
    if (!boxes.length) return;

    let cachedPaths = [];

    function drawPaths() {
      const svg = document.getElementById("paths-svg");
      const inner = networkRef.current;
      const hub = document.getElementById("brain-anchor");
      if (!svg || !inner || !hub || boxes.length === 0) return;

      const innerRect = inner.getBoundingClientRect();
      svg.setAttribute("width", innerRect.width);
      svg.setAttribute("height", innerRect.height);
      svg.setAttribute("viewBox", `0 0 ${innerRect.width} ${innerRect.height}`);

      const hubRect = hub.getBoundingClientRect();
      const startX = hubRect.left + hubRect.width / 2 - innerRect.left;
      const startY = hubRect.bottom - innerRect.top - 6;

      svg.innerHTML = "";
      cachedPaths = [];

      boxes.forEach((box) => {
        const r = box.getBoundingClientRect();
        const endX = r.left + r.width / 2 - innerRect.left;
        const endY = r.top - innerRect.top + 2;

        const dy = Math.max(endY - startY, 40);
        const c1x = startX;
        const c1y = startY + dy * 0.45;
        const c2x = endX;
        const c2y = endY - dy * 0.45;

        const d = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d); path.setAttribute("class", "line");
        path.style.stroke = box.style.getPropertyValue("--box-color") || "var(--signal)";
        svg.appendChild(path);
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`; path.style.strokeDashoffset = `${length}`;
        cachedPaths.push({ el: path, length, box });
      });
    }

    function initReveal() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const box = entry.target;
            box.classList.add("in-view");
            const match = cachedPaths.find((p) => p.box === box);
            if (match) match.el.style.strokeDashoffset = "0";
            observer.unobserve(box);
          });
        },
        { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
      );
      boxes.forEach((box) => observer.observe(box));
    }

    requestAnimationFrame(() => { drawPaths(); initReveal(); });
    let t; const onResize = () => { clearTimeout(t); t = setTimeout(drawPaths, 150); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const rows = [];
  for (let i = 0; i < STORIES.length; i += 2) rows.push(STORIES.slice(i, i + 2));
  let refIndex = 0;

  const handleSelectStory = (story, rect) => {
    if (!story) {
      setActiveSelection(null);
      return;
    }
    if (!rect) {
      const idx = STORIES.findIndex((s) => s.id === story.id);
      const el = boxRefs.current[idx];
      rect = el ? el.getBoundingClientRect() : {
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
        width: 400,
        height: 300,
      };
    }
    setActiveSelection({ story, originRect: rect });
  };

  return (
    <section className="network" aria-label="Brain and story map">
      <div className="network-inner" ref={networkRef}>
        <canvas id="beams-canvas" aria-hidden="true"></canvas>
        <svg id="paths-svg" aria-hidden="true" style={{ opacity: 0, pointerEvents: "none" }}></svg>
        <div className="mascot" id="mascot" aria-hidden="true"><span className="dot"></span></div>
        <div className="brain-hub">
          <BrainHub />
        </div>
        <div className="story-rows" id="story-rows">
          {rows.map((row, rowIdx) => (
            <div className="story-row" key={rowIdx}>
              {row.map((story) => {
                const idx = refIndex++;
                return (
                  <PaperCard
                    key={story.id}
                    story={story}
                    onBoxRef={(el) => { boxRefs.current[idx] = el; }}
                    onSelect={handleSelectStory}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="network-footnote"><strong>8</strong> signals mapped &nbsp;·&nbsp; tap any node to watch</p>

      {activeSelection && (
        <MorphingExpandedCard
          story={activeSelection.story}
          originRect={activeSelection.originRect}
          onClose={() => setActiveSelection(null)}
          onSelectStory={(s, r) => handleSelectStory(s, r)}
        />
      )}
    </section>
  );
}
