"use client";
import { useEffect, useRef, useState } from "react";
import { STORIES } from "@/lib/stories";
import StoryBox from "./StoryBox";
import BrainHub from "./BrainHub";
import MorphingExpandedCard from "./MorphingExpandedCard";

export default function StoryNetwork({ paperCards = false }) {
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
      const centerX = hubRect.left + hubRect.width / 2 - innerRect.left;
      const startY = hubRect.bottom - innerRect.top - 2;
      const isMobile = innerRect.width < 768;

      // BATANG UTAMA (ROOT TRUNK): Dibuat pendek saja di awal (14-20px), lalu langsung bercabang
      const stemLength = isMobile ? 14 : 20;
      const junctionX = centerX;
      const junctionY = startY + stemLength;

      svg.innerHTML = "";
      cachedPaths = [];

      const numBoxes = boxes.length;
      const numPairs = Math.ceil(numBoxes / 2);

      boxes.forEach((box, i) => {
        const r = box.getBoundingClientRect();
        const endX = r.left + r.width / 2 - innerRect.left;
        const endY = r.top - innerRect.top + 2;

        const isLeft = (i % 2 === 0);
        const sideSign = isLeft ? -1 : 1;
        const pairIndex = Math.floor(i / 2);
        const pairFactor = numPairs > 1 ? pairIndex / (numPairs - 1) : 0;

        const dy = Math.max(endY - junctionY, 40);
        const dx = endX - junctionX;

        // Khusus kartu 0 (Drugs) yang berjarak sangat dekat di bawah otak, lengkungan dibatasi 12-14px agar tidak meliuk C
        const bowBase = (i === 0) ? (dy < 250 ? 12 : 24) : (26 + (1 - pairFactor) * 36);
        const fanBow = sideSign * bowBase;
        const c1x = junctionX + dx * 0.22 + fanBow;
        const c1y = junctionY + dy * 0.34;
        const c2x = endX - dx * 0.10;
        const c2y = endY - dy * 0.36;

        // Path: Awalnya 1 garis batang (M centerX startY -> L junctionX junctionY), lalu bercabang (C c1 c2 end)
        const d = `M ${centerX} ${startY} L ${junctionX} ${junctionY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("class", "line");
        const color = box.style.getPropertyValue("--box-color") || "var(--signal)";
        path.style.stroke = color;
        svg.appendChild(path);

        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;

        path._stemLength = stemLength;
        path._junctionPt = { x: junctionX, y: junctionY };
        path._rootPt = { x: centerX, y: startY };
        path._index = i;

        // CACHE: Pre-calculate points agar drawBeam tidak lag
        const rawPts = [];
        for (let j = 0; j <= 90; j++) {
          const p = path.getPointAtLength((j / 90) * length);
          rawPts.push({ x: p.x, y: p.y, s: j / 90 });
        }
        path._rawPts = rawPts;

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

    function initMascot() {
      const mascot = document.getElementById("mascot");
      if (!mascot || cachedPaths.length === 0) return;

      let idx = 0;
      let dir = 1;
      let t = 0;
      let last = performance.now();
      const PIXELS_PER_SEC = 260;
      const PAUSE_MS = 380;
      let pausedUntil = 0;
      let rafId;

      function frame(now) {
        const dt = (now - last) / 1000;
        last = now;

        const current = cachedPaths[idx];
        if (!current || current.length === 0) {
          idx = (idx + 1) % cachedPaths.length;
          rafId = requestAnimationFrame(frame);
          return;
        }

        if (now < pausedUntil) {
          rafId = requestAnimationFrame(frame);
          return;
        }

        const step = (PIXELS_PER_SEC * dt) / current.length;
        t += step * dir;

        if (t >= 1) {
          t = 1; dir = -1; pausedUntil = now + PAUSE_MS;
        } else if (t <= 0) {
          t = 0; dir = 1;
          idx = (idx + 1) % cachedPaths.length;
          pausedUntil = now + PAUSE_MS;
        }

        const len = current.length * t;
        const pt = current.el.getPointAtLength(len);
        mascot.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
        const dotEl = mascot.querySelector(".dot");
        if (dotEl) dotEl.style.background = current.el.style.stroke || "var(--signal)";

        rafId = requestAnimationFrame(frame);
      }

      rafId = requestAnimationFrame(frame);
      return () => rafId && cancelAnimationFrame(rafId);
    }

    // Wave beam canvas renderer
    function startBeams() {
      const canvas = document.getElementById("beams-canvas");
      if (!canvas) return;

      let ctx;
      let cssW = 0, cssH = 0;
      let rafId;

      function syncSize() {
        const inner = networkRef.current;
        if (!inner || !canvas) return;
        const r = inner.getBoundingClientRect();
        cssW = r.width; cssH = r.height;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        canvas.style.width = cssW + "px";
        canvas.style.height = cssH + "px";
        ctx = canvas.getContext("2d");
      }

      function hexToRgba(hex, alpha) {
        const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec((hex || "").trim());
        if (!m) return `rgba(255,209,102,${alpha})`;
        return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
      }

      function drawBeam(pathEl, seed, color, t) {
        const total = pathEl.getTotalLength();
        const N = 90;
        const svg = document.getElementById("paths-svg");
        const svgW = parseFloat(svg.getAttribute("width")) || cssW;
        const svgH = parseFloat(svg.getAttribute("height")) || cssH;
        const scaleX = cssW / svgW; const scaleY = cssH / svgH;

        const raw = [];
        if (pathEl._rawPts) {
          for (let j = 0; j <= N; j++) {
            const p = pathEl._rawPts[j];
            raw.push({ x: p.x * scaleX, y: p.y * scaleY, s: p.s });
          }
        } else {
          for (let j = 0; j <= N; j++) {
            const s = j / N;
            const p = pathEl.getPointAtLength(s * total);
            raw.push({ x: p.x * scaleX, y: p.y * scaleY, s });
          }
        }

        const isMobile = cssW < 768;
        const stemLength = pathEl._stemLength || (isMobile ? 14 : 20);
        const junctionRatio = Math.min(0.12, stemLength / total);

        const baseAmp = isMobile ? 9 : 14;
        const AMP = (pathEl._index === 0 && total < 280) ? 3.5 : baseAmp;

        const pts = [];
        for (let i = 0; i <= N; i++) {
          const s = raw[i].s;
          // Di batang utama (sebelum cabang), disp = 0 agar tetap menjadi 1 garis tunggal yang solid
          const ramp = s <= junctionRatio
            ? 0.0
            : Math.min(1.0, (s - junctionRatio) / 0.10);

          const disp =
            (Math.sin(s * 13.82 + seed + t * 0.80) * AMP +
            Math.sin(s * 32.04 - seed * 1.8 - t * 0.45) * (AMP * 0.40) +
            Math.sin(s * 69.00 + seed * 2.5 + t * 0.30) * (AMP * 0.17) +
            Math.round(Math.sin(s * 127.0 + seed + t * 0.90) * 0.45 / 0.3) * 0.3 * (AMP * 0.13)) * ramp;
          const prev = raw[Math.max(0, i - 1)];
          const next = raw[Math.min(N, i + 1)];
          const tx = next.x - prev.x, ty = next.y - prev.y;
          const tl = Math.sqrt(tx * tx + ty * ty) || 1;
          const nx = -ty / tl, ny = tx / tl;
          pts.push({ x: raw[i].x + nx * disp, y: raw[i].y + ny * disp });
        }

        function tracePath() {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let k = 1; k <= N; k++) ctx.lineTo(pts[k].x, pts[k].y);
        }

        ctx.lineCap = "round"; ctx.lineJoin = "round";
        tracePath(); ctx.strokeStyle = hexToRgba(color, 0.12); ctx.lineWidth = isMobile ? 8 : 14; ctx.shadowBlur = isMobile ? 14 : 24; ctx.shadowColor = color; ctx.stroke();
        tracePath(); ctx.strokeStyle = hexToRgba(color, 0.35); ctx.lineWidth = isMobile ? 3.2 : 5; ctx.shadowBlur = isMobile ? 6 : 10; ctx.shadowColor = color; ctx.stroke();
        tracePath(); ctx.strokeStyle = hexToRgba(color, 0.95); ctx.lineWidth = isMobile ? 1.1 : 1.5; ctx.shadowBlur = 4; ctx.shadowColor = color; ctx.stroke();
        ctx.shadowBlur = 0;
      }

      function render(now) {
        rafId = requestAnimationFrame(render);
        if (!ctx || cssW === 0 || cssH === 0) return;
        const svg = document.getElementById("paths-svg");
        const paths = svg ? svg.querySelectorAll("path.line") : [];
        if (!paths.length) return;
        const t2 = now * 0.001;
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);
        paths.forEach((pathEl, i) => {
          const color = pathEl.style.stroke || "#ffd166";
          drawBeam(pathEl, i * 1.7, color, t2);
        });

        // Gambar titik simpul neural (junction node) di pertemuan cabang persis seperti di gambar referensi
        if (paths.length > 0 && paths[0]._junctionPt) {
          const isMobile = cssW < 768;
          const jpt = paths[0]._junctionPt;
          const rpt = paths[0]._rootPt;

          // Titik simpul percabangan (junction node)
          ctx.beginPath();
          ctx.arc(jpt.x, jpt.y, isMobile ? 3.5 : 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#fff8e0";
          ctx.shadowBlur = isMobile ? 8 : 14;
          ctx.shadowColor = "#ffd166";
          ctx.fill();

          // Titik pangkal keluar otak (root node)
          if (rpt) {
            ctx.beginPath();
            ctx.arc(rpt.x, rpt.y, isMobile ? 2.5 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = "#ffd166";
            ctx.shadowBlur = 6;
            ctx.shadowColor = "#E8A33D";
            ctx.fill();
          }

          ctx.shadowBlur = 0;
        }
      }

      function tryStart(attempt) {
        const svg = document.getElementById("paths-svg");
        const paths = svg ? svg.querySelectorAll("path.line") : [];
        if (paths.length > 0) { if (!rafId) rafId = requestAnimationFrame(render); return; }
        if (attempt < 40) setTimeout(() => tryStart(attempt + 1), 100);
      }

      syncSize();
      if (!ctx) return;
      tryStart(0);

      let resizeTimer;
      const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(syncSize, 200); };
      window.addEventListener("resize", onResize);
      return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); };
    }

    requestAnimationFrame(() => {
      drawPaths();
      initReveal();
      initMascot();
      setTimeout(startBeams, 200);
    });

    let resizeTimer;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawPaths, 150); };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawPaths, 300); });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  // Build rows of 2
  const rows = [];
  for (let i = 0; i < STORIES.length; i += 2) {
    rows.push(STORIES.slice(i, i + 2));
  }

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
                const currentRef = refIndex;
                refIndex++;
                return (
                  <StoryBox
                    key={story.id}
                    story={story}
                    onBoxRef={(el) => { boxRefs.current[currentRef] = el; }}
                    onSelect={handleSelectStory}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="network-footnote"><strong>8</strong> signals mapped &nbsp;·&nbsp; tap any node to watch</p>

      {/* True FLIP Morphing Expanding Card */}
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
