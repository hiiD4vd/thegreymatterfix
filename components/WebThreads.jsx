"use client";
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import "./WebThreads.css";

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const FAN_MODE = { center: 0, left: 1, right: 2 };

// WeakMap supaya multiple instance tidak konflik
const ctxMap = new WeakMap();

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uThreadCount;
uniform float uFrequency;
uniform float uSpread;
uniform float uTaper;
uniform float uPosition;
uniform float uFanMode;
uniform float uGlow;
uniform float uFalloff;
uniform float uThickness;
uniform float uBrightness;
uniform float uOpacity;
uniform float uMirror;
uniform float uShimmer;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uBackgroundColor;
uniform bool uLightMode;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uEnableMouse;
uniform float uMouseActive;
out vec4 fragColor;

#define TAU 6.28318530718
#define MAX_THREADS 10

float glow(float x, float str, float dist) {
  return dist / pow(max(x, 1e-4), str);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float n = max(uThreadCount, 1.0);

  float pinchX = uFanMode < 0.5 ? 0.5 : (uFanMode < 1.5 ? 0.0 : 1.0);
  if (uEnableMouse > 0.5) {
    pinchX = mix(pinchX, uMouse.x, clamp(uMouseStrength, 0.0, 1.0) * uMouseActive);
  }

  // Skala adaptif untuk layar portrait / HP (aspect < 1.0):
  // Garis dibuat lebih datar dan tidak melonjak tinggi menusuk teks di mobile.
  // Di desktop (aspect >= 1.0), kedua skala ini bernilai 1.0 sehingga desktop 100% tidak berubah.
  float aspect = iResolution.x / max(iResolution.y, 1.0);
  float mobileFlatScale = aspect < 1.0 ? mix(0.70, 1.0, clamp((aspect - 0.35) / 0.65, 0.0, 1.0)) : 1.0;
  float mobileFreqScale = aspect < 1.0 ? mix(0.85, 1.0, clamp((aspect - 0.35) / 0.65, 0.0, 1.0)) : 1.0;

  float spreadDx = uSpread * abs(uv.x - pinchX);
  float baseT = iTime * uSpeed;
  float tauOverN = TAU / n;
  float mirror = uMirror > 0.5 ? sign(pinchX - uv.x) : 1.0;
  bool doShimmer = uShimmer > 0.5;
  float shimmerT = iTime * 1.7;
  float invThickness = 1.0 / max(uThickness, 0.01);
  float xFreq = uv.x * (uFrequency * mobileFreqScale);
  float yOff = uv.y - uPosition;
  float ciScale = n > 1.0 ? 1.0 / (n - 1.0) : 0.0;

  vec3 col = vec3(0.0);
  float gsum = 0.0;

  for (int idx = 0; idx < MAX_THREADS; idx++) {
    float i = float(idx);
    if (i >= n) break;

    float amplitude = spreadDx * (1.0 + i * uTaper) * mobileFlatScale;
    float shimmer = doShimmer ? sin(shimmerT + i * 1.3) * 0.35 : 0.0;
    float phase = (baseT + i * tauOverN) * mirror + shimmer;

    float sdf = abs(yOff + sin(xFreq + phase) * amplitude) * invThickness;

    float g = glow(sdf, uFalloff, uGlow);
    float ci = i * ciScale;
    vec3 threadCol = mix(uColor1, uColor2, ci);

    col += g * threadCol;
    gsum += g;
  }

  float coreAmt = smoothstep(0.5, 2.2, gsum);
  col = mix(col, uColor3 * gsum, coreAmt * 0.5);

  float bright = uBrightness;
  if (uEnableMouse > 0.5) {
    vec2 md = uv - uMouse;
    float d2 = dot(md, md);
    bright += clamp(uMouseStrength, 0.0, 1.0) * uMouseActive * exp(-d2 * 6.0) * 0.6;
  }
  col *= bright;

  float alpha = clamp(gsum, 0.0, 1.0) * uOpacity;
  vec3 outRgb = col * alpha;

  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    alpha = clamp(alpha + gv, 0.0, 1.0);
  }

  if (uLightMode) {
    vec3 mapped = vec3(1.0) - exp(-max(col, vec3(0.0)) * 1.3);
    float rawEnergy = clamp(max(mapped.r, max(mapped.g, mapped.b)) * uOpacity, 0.0, 1.0);
    float coverage = smoothstep(0.18, 0.72, rawEnergy);
    coverage *= coverage;
    vec3 hue = mapped / max(max(mapped.r, max(mapped.g, mapped.b)), 1e-4);
    vec3 chroma = pow(clamp(hue, 0.0, 1.0), vec3(0.78));
    vec3 pigment = mix(chroma, vec3(0.08), 0.12);
    vec3 ink = mix(vec3(0.9), pigment, 0.82 + coverage * 0.18);
    fragColor = vec4(mix(uBackgroundColor, ink, coverage), 1.0);
  } else {
    // Render solid: blend background color dengan thread — tidak ada alpha compositing issue
    vec3 threadBlend = mix(uBackgroundColor, col, clamp(gsum * uBrightness, 0.0, 1.0) * uOpacity);
    fragColor = vec4(threadBlend, 1.0);
  }
}
`;

const WebThreads = ({
  color1 = "#E8A33D",
  color2 = "#ffd166",
  color3 = "#fff8e0",
  backgroundColor = "#12172b",
  threadCount = 6,
  speed = 0.2,
  frequency = 5.0,
  spread = 0.18,
  taper = 1.0,
  position = 0.5,
  fanMode = "center",
  glow = 0.02,
  falloff = 0.6,
  thickness = 1.1,
  brightness = 0.6,
  opacity = 1.0,
  mirror = true,
  shimmer = false,
  grain = true,
  grainIntensity = 0.05,
  mouseInteraction = true,
  mouseStrength = 0.3,
  lightMode = false,
  className = "",
}) => {
  const containerRef = useRef(null);
  const currentProps = {
    color1, color2, color3, backgroundColor, threadCount, speed, frequency,
    spread, taper, position, fanMode, glow, falloff, thickness, brightness,
    opacity, mirror, shimmer, grain, grainIntensity, mouseInteraction,
    mouseStrength, lightMode,
  };
  const propsRef = useRef(currentProps);
  propsRef.current = currentProps;

  // Ref untuk mouseInteraction/mouseStrength — update tanpa re-init WebGL
  const mouseRef = useRef({ enabled: mouseInteraction, strength: mouseStrength });

  const updateUniforms = (program, p) => {
    if (!program?.uniforms) return;
    const u = program.uniforms;
    u.uSpeed.value = p.speed;
    u.uThreadCount.value = Math.round(p.threadCount);
    u.uFrequency.value = p.frequency;
    u.uSpread.value = p.spread;
    u.uTaper.value = p.taper;
    u.uPosition.value = p.position;
    u.uFanMode.value = FAN_MODE[p.fanMode] ?? 0;
    u.uGlow.value = p.glow;
    u.uFalloff.value = p.falloff;
    u.uThickness.value = p.thickness;
    u.uBrightness.value = p.brightness;
    u.uOpacity.value = p.opacity;
    u.uMirror.value = p.mirror ? 1.0 : 0.0;
    u.uShimmer.value = p.shimmer ? 1.0 : 0.0;
    u.uGrain.value = p.grain ? 1.0 : 0.0;
    u.uGrainIntensity.value = p.grainIntensity;
    u.uLightMode.value = p.lightMode;
    u.uMouseStrength.value = p.mouseStrength;
    u.uEnableMouse.value = p.mouseInteraction ? 1.0 : 0.0;

    const rgb1 = hexToRgb(p.color1);
    u.uColor1.value[0] = rgb1[0]; u.uColor1.value[1] = rgb1[1]; u.uColor1.value[2] = rgb1[2];
    const rgb2 = hexToRgb(p.color2);
    u.uColor2.value[0] = rgb2[0]; u.uColor2.value[1] = rgb2[1]; u.uColor2.value[2] = rgb2[2];
    const rgb3 = hexToRgb(p.color3);
    u.uColor3.value[0] = rgb3[0]; u.uColor3.value[1] = rgb3[1]; u.uColor3.value[2] = rgb3[2];
    const bg = hexToRgb(p.backgroundColor);
    u.uBackgroundColor.value[0] = bg[0]; u.uBackgroundColor.value[1] = bg[1]; u.uBackgroundColor.value[2] = bg[2];
  };

  // --- useEffect #1: INIT (hanya sekali saat mount, tangguh terhadap WebGL context limit) ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let renderer = null;
    let gl = null;
    let canvas = null;
    let ro = null;
    let io = null;
    let raf = 0;
    let retryTimer = null;
    let hydrationTimers = [];
    let cleanupListeners = () => {};

    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const cleanupActive = () => {
      tryStop();
      cleanupListeners();
      hydrationTimers.forEach((t) => clearTimeout(t));
      hydrationTimers = [];
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (ro) {
        ro.disconnect();
        ro = null;
      }
      if (io) {
        io.disconnect();
        io = null;
      }
      if (canvas) {
        try {
          if (canvas.parentNode === container) container.removeChild(canvas);
        } catch {}
        canvas = null;
      }
      if (gl) {
        try {
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        } catch {}
        gl = null;
      }
      ctxMap.delete(container);
    };

    function initWebGL(attempt = 0) {
      if (isDisposed) return;

      // Bersihkan canvas lama jika ada di container
      while (container.firstChild) {
        try {
          container.removeChild(container.firstChild);
        } catch {}
      }

      try {
        renderer = new Renderer({
          webgl: 2,
          alpha: true,
          premultipliedAlpha: true,
          antialias: false,
          powerPreference: "high-performance",
          dpr: 1,
        });
        gl = renderer.gl;
      } catch (err) {
        console.warn(`[WebThreads] WebGL context unavailable (attempt ${attempt + 1}):`, err.message);
        // Retry otomatis jika context masih tertahan oleh reload/tab sebelumnya
        if (attempt < 4 && !isDisposed) {
          retryTimer = setTimeout(() => initWebGL(attempt + 1), 300);
        }
        return;
      }

      if (!gl || isDisposed) return;
      gl.clearColor(0, 0, 0, 0);

      canvas = gl.canvas;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.pointerEvents = "auto";
      container.appendChild(canvas);

      // Context lost & restored safety
      const onContextLost = (e) => {
        e.preventDefault();
        tryStop();
      };
      const onContextRestored = () => {
        if (!isDisposed) initWebGL(0);
      };
      canvas.addEventListener("webglcontextlost", onContextLost);
      canvas.addEventListener("webglcontextrestored", onContextRestored);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uSpeed: { value: 0.2 },
          uThreadCount: { value: 6 },
          uFrequency: { value: 5.0 },
          uSpread: { value: 0.18 },
          uTaper: { value: 1.0 },
          uPosition: { value: 0.5 },
          uFanMode: { value: 0 },
          uGlow: { value: 0.02 },
          uFalloff: { value: 0.6 },
          uThickness: { value: 1.1 },
          uBrightness: { value: 0.6 },
          uOpacity: { value: 1.0 },
          uMirror: { value: 1.0 },
          uShimmer: { value: 0.0 },
          uGrain: { value: 1.0 },
          uGrainIntensity: { value: 0.05 },
          uColor1: { value: new Float32Array([1, 1, 1]) },
          uColor2: { value: new Float32Array([1, 1, 1]) },
          uColor3: { value: new Float32Array([1, 1, 1]) },
          uBackgroundColor: { value: new Float32Array([1, 1, 1]) },
          uLightMode: { value: false },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uMouseStrength: { value: 0.3 },
          uEnableMouse: { value: 1.0 },
          uMouseActive: { value: 0 },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });
      ctxMap.set(container, { renderer, program, mesh });
      updateUniforms(program, propsRef.current);

      const setSize = () => {
        if (isDisposed || !renderer || !gl) return;
        const rect = container.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width || window.innerWidth));
        const h = Math.max(1, Math.floor(rect.height || window.innerHeight));
        renderer.setSize(w, h);
        const res = program.uniforms.iResolution.value;
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
        renderer.render({ scene: mesh });
      };

      ro = new ResizeObserver(setSize);
      ro.observe(container);
      ro.observe(document.body);
      setSize();

      const onOrientationChange = () => setTimeout(setSize, 100);
      window.addEventListener("orientationchange", onOrientationChange);

      const currentMouse = [0.5, 0.5];
      const targetMouse = [0.5, 0.5];
      let currentActive = 0;
      let targetActive = 0;

      const onMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        targetMouse[0] = (e.clientX - rect.left) / rect.width;
        targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
        targetActive = 1;
      };
      const onMouseEnter = () => {
        targetActive = 1;
      };
      const onMouseLeave = () => {
        targetActive = 0;
      };

      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseenter", onMouseEnter);
      canvas.addEventListener("mouseleave", onMouseLeave);

      let isVisible = true;
      let isPageVisible = !document.hidden;
      const t0 = performance.now();

      const loop = (t) => {
        if (isDisposed || !renderer) return;
        program.uniforms.iTime.value = (t - t0) * 0.001;

        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
        currentActive += 0.05 * (targetActive - currentActive);

        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
        program.uniforms.uMouseActive.value = currentActive;
        program.uniforms.uEnableMouse.value = mouseRef.current.enabled ? 1.0 : 0.0;
        program.uniforms.uMouseStrength.value = mouseRef.current.strength;

        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(loop);
      };

      const tryStart = () => {
        if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
      };

      io = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          isVisible ? tryStart() : tryStop();
        },
        { threshold: 0 }
      );
      io.observe(container);

      const onVisibility = () => {
        isPageVisible = !document.hidden;
        isPageVisible ? tryStart() : tryStop();
      };
      document.addEventListener("visibilitychange", onVisibility);

      tryStart();

      hydrationTimers.push(setTimeout(setSize, 50));
      hydrationTimers.push(setTimeout(setSize, 200));
      hydrationTimers.push(setTimeout(setSize, 600));
      hydrationTimers.push(setTimeout(setSize, 1500));

      const onWindowResize = () => setSize();
      window.addEventListener("resize", onWindowResize);

      cleanupListeners = () => {
        window.removeEventListener("resize", onWindowResize);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("orientationchange", onOrientationChange);
        if (canvas) {
          canvas.removeEventListener("mousemove", onMouseMove);
          canvas.removeEventListener("mouseenter", onMouseEnter);
          canvas.removeEventListener("mouseleave", onMouseLeave);
          canvas.removeEventListener("webglcontextlost", onContextLost);
          canvas.removeEventListener("webglcontextrestored", onContextRestored);
        }
      };
    }

    initWebGL(0);

    return () => {
      isDisposed = true;
      cleanupActive();
    };
  }, []); // hanya sekali saat mount

  // --- useEffect #2: Update uniforms saja saat props berubah (tanpa re-init) ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    updateUniforms(ctx.program, currentProps);
    mouseRef.current.enabled = mouseInteraction;
    mouseRef.current.strength = mouseStrength;
  }, [
    color1, color2, color3, backgroundColor, threadCount, speed, frequency,
    spread, taper, position, fanMode, glow, falloff, thickness, brightness,
    opacity, mirror, shimmer, grain, grainIntensity, mouseInteraction,
    mouseStrength, lightMode,
  ]);

  return (
    <div
      ref={containerRef}
      className={`web-threads-container ${className}`.trim()}
    />
  );
};

export default WebThreads;