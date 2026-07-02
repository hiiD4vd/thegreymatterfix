"use client";
import { useEffect, useRef, useState } from "react";
import { STORIES } from "@/lib/stories";
import StoryBox from "./StoryBox";
import BrainHub from "./BrainHub";
import MorphingExpandedCard from "./MorphingExpandedCard";

export default function StoryNetworkWebGL({ paperCards = false }) {
  const [activeSelection, setActiveSelection] = useState(null);
  const boxRefs = useRef([]);
  const networkRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const boxes = boxRefs.current.filter(Boolean);
    if (!boxes.length) return;

    let cachedPaths = [];

    // 1. Kalkulasi jalur SVG Bezier yang menghubungkan anchor otak ke masing-masing kartu
    function drawPaths() {
      const svg = document.getElementById("paths-svg-webgl");
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

      // BATANG UTAMA (ROOT TRUNK): Dibuat pendek saja di awal, lalu langsung bercabang
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

        // Distribusikan jalur: genap ke sisi kiri, ganjil ke sisi kanan
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

        // Awalnya 1 garis pendek dari otak (M centerX startY L junctionX junctionY), lalu langsung bercabang (C ...)
        const d = `M ${centerX} ${startY} L ${junctionX} ${junctionY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("class", "line");
        const color = box.style.getPropertyValue("--box-color") || "#ffd166";
        path.style.stroke = color;
        svg.appendChild(path);

        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;

        path._stemLength = stemLength;
        path._junctionPt = { x: junctionX, y: junctionY };
        path._rootPt = { x: centerX, y: startY };

        // Precompute titik dasar bezier beserta vektor normal
        const N = 90;
        const rawPts = [];
        for (let j = 0; j <= N; j++) {
          const s = j / N;
          const p = path.getPointAtLength(s * length);
          rawPts.push({ x: p.x, y: p.y, s });
        }

        // Hitung normal halus untuk tiap titik
        for (let j = 0; j <= N; j++) {
          const prev = rawPts[Math.max(0, j - 1)];
          const next = rawPts[Math.min(N, j + 1)];
          const tx = next.x - prev.x;
          const ty = next.y - prev.y;
          const len = Math.sqrt(tx * tx + ty * ty) || 1;
          rawPts[j].nx = -ty / len;
          rawPts[j].ny = tx / len;
        }

        path._rawPts = rawPts;
        cachedPaths.push({ el: path, length, box, color, index: i });
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

    // 2. Engine Renderer Luminous Beam (Estetika Neon Glow WebThreads + Gerak Gelombang Neuron)
    function startLuminousBeams() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let ctx = canvas.getContext("2d");
      let cssW = 0, cssH = 0;
      let rafId;

      function syncSize() {
        const inner = networkRef.current;
        if (!inner || !canvas) return;
        const r = inner.getBoundingClientRect();
        cssW = Math.max(1, Math.floor(r.width));
        cssH = Math.max(1, Math.floor(r.height));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        canvas.style.width = cssW + "px";
        canvas.style.height = cssH + "px";
      }

      function hexToRgb(hex) {
        const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec((hex || "").trim());
        if (!m) return { r: 255, g: 209, b: 102 };
        return {
          r: parseInt(m[1], 16),
          g: parseInt(m[2], 16),
          b: parseInt(m[3], 16)
        };
      }

      function drawSingleLuminousBeam(pathEl, seed, hexColor, t, beamIdx) {
        if (!pathEl._rawPts || pathEl._rawPts.length === 0) return;
        const raw = pathEl._rawPts;
        const N = raw.length - 1;
        const isMobile = cssW < 768;
        const stemLength = pathEl._stemLength || (isMobile ? 14 : 20);
        const total = pathEl.getTotalLength ? pathEl.getTotalLength() : 300;
        const junctionRatio = Math.min(0.12, stemLength / total);

        const baseAmp = isMobile ? 10 : 16;
        const AMP = (beamIdx === 0 && total < 280) ? 3.5 : baseAmp;

        const pts = [];
        for (let i = 0; i <= N; i++) {
          const s = raw[i].s;

          // Di batang pendek (s <= junctionRatio), disp = 0 agar 1 batang menyatu rapi tanpa getaran terpisah
          const ramp = s <= junctionRatio
            ? 0.0
            : Math.min(1.0, (s - junctionRatio) / 0.08);

          // Multi-frekuensi wave formula: bergelombang jelas, mengalun mulus
          const wave1 = Math.sin(s * 7.20 + seed + t * 1.10) * AMP;
          const wave2 = Math.sin(s * 14.40 - seed * 1.6 - t * 0.65) * (AMP * 0.45);
          const wave3 = Math.sin(s * 22.00 + seed * 2.2 + t * 0.40) * (AMP * 0.18);

          // Envelope agar titik pangkal menempel erat di otak dan titik ujung di kartu
          const envelope = Math.sin(Math.PI * Math.pow(s, 0.88));
          const disp = (wave1 + wave2 + wave3) * envelope * ramp;

          pts.push({
            x: raw[i].x + raw[i].nx * disp,
            y: raw[i].y + raw[i].ny * disp,
            s
          });
        }

        // Trace geometry path
        function trace() {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let k = 1; k <= N; k++) {
            ctx.lineTo(pts[k].x, pts[k].y);
          }
        }

        const { r, g, b } = hexToRgb(hexColor);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // LAYER 1: Deep Atmospheric Ambient Glow (Halus, tidak menumpuk overblown)
        trace();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${isMobile ? 0.30 : 0.45})`;
        ctx.lineWidth = isMobile ? 2.2 : 3.4;
        ctx.shadowBlur = isMobile ? 14 : 26;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.85)`;
        ctx.stroke();

        // LAYER 2: Vibrant Mid Corona
        trace();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${isMobile ? 0.75 : 0.90})`;
        ctx.lineWidth = isMobile ? 1.4 : 2.0;
        ctx.shadowBlur = isMobile ? 6 : 12;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1.0)`;
        ctx.stroke();

        // LAYER 3: Hot Incandescent White-Gold Core
        trace();
        ctx.strokeStyle = "rgba(255, 252, 240, 0.95)";
        ctx.lineWidth = isMobile ? 0.9 : 1.2;
        ctx.shadowBlur = 3;
        ctx.shadowColor = "#ffffff";
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset blur

        // LAYER 4: Synaptic Impulse Pulse (Denyut energi halus yang meluncur dari otak ke kartu)
        const pulseSpeed = 0.34;
        const pulseProgress = (t * pulseSpeed + (beamIdx * 0.23)) % 1.0;
        const pulseIndex = Math.min(N, Math.floor(pulseProgress * N));
        const pulsePt = pts[pulseIndex];

        if (pulsePt) {
          const pRadius = isMobile ? 7 : 12;
          const radGrad = ctx.createRadialGradient(
            pulsePt.x, pulsePt.y, 0,
            pulsePt.x, pulsePt.y, pRadius
          );
          radGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          radGrad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.85)`);
          radGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.25)`);
          radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(pulsePt.x, pulsePt.y, pRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function render(now) {
        rafId = requestAnimationFrame(render);
        if (!ctx || cssW === 0 || cssH === 0) return;

        const svg = document.getElementById("paths-svg-webgl");
        const paths = svg ? svg.querySelectorAll("path.line") : [];
        if (!paths.length) return;

        const t = now * 0.001;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const isMobile = cssW < 768;

        // Reset transform & clear
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);

        // KUNCI UTAMA: Additive Blending ("lighter")
        // Ini teknologi rendering pencampuran cahaya fisik yang sama persis dengan WebGL additive shader!
        ctx.globalCompositeOperation = "lighter";

        paths.forEach((pathEl, i) => {
          const color = pathEl.style.stroke || "#ffd166";
          drawSingleLuminousBeam(pathEl, i * 1.75, color, t, i);
        });

        // Gambar titik simpul neural (junction node) di pertemuan cabang persis seperti di gambar referensi
        if (paths.length > 0 && paths[0]._junctionPt) {
          const jpt = paths[0]._junctionPt;
          const rpt = paths[0]._rootPt;

          // Titik simpul percabangan (junction node)
          ctx.beginPath();
          ctx.arc(jpt.x, jpt.y, isMobile ? 3.5 : 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
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

        // Reset composite operation
        ctx.globalCompositeOperation = "source-over";
      }

      function tryStart(attempt) {
        const svg = document.getElementById("paths-svg-webgl");
        const paths = svg ? svg.querySelectorAll("path.line") : [];
        if (paths.length > 0) {
          if (!rafId) rafId = requestAnimationFrame(render);
          return;
        }
        if (attempt < 40) setTimeout(() => tryStart(attempt + 1), 80);
      }

      syncSize();
      tryStart(0);

      let resizeTimer;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          syncSize();
          drawPaths();
        }, 150);
      };
      window.addEventListener("resize", onResize);
      return () => {
        cancelAnimationFrame(rafId);
      };
    }

    let resizeTimer;
    let cleanupBeams; // reference untuk cleanup beams

    requestAnimationFrame(() => {
      drawPaths();
      initReveal();
      cleanupBeams = startLuminousBeams();
    });

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Redraw SVG paths dengan koordinat baru
        drawPaths();
      }, 150);
    };

    window.addEventListener("resize", onResize);
    // Juga listen ke orientationchange agar HP landscape/portrait switch responsif
    window.addEventListener("orientationchange", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawPaths, 300);
    });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      cleanupBeams?.();
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
      rect = el
        ? el.getBoundingClientRect()
        : {
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
        {/* Canvas Luminous Bloom: Additive Blending (Pendaran Cahaya WebThreads) */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Hidden SVG paths untuk kalkulasi bezier points */}
        <svg
          id="paths-svg-webgl"
          aria-hidden="true"
          style={{
            opacity: 0,
            pointerEvents: "none",
            position: "absolute",
            zIndex: -1,
          }}
        />

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
                    onBoxRef={(el) => {
                      boxRefs.current[currentRef] = el;
                    }}
                    onSelect={handleSelectStory}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="network-footnote">
        <strong>8</strong> signals mapped &nbsp;·&nbsp; tap any node to watch
      </p>

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
