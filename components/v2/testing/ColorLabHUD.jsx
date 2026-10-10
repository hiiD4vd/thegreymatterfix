"use client";
import { useState } from "react";
import Link from "next/link";

// Narupa Quick Swatches for easy picking
const NARUPA_SWATCHES = [
  { name: "Terracotta", color: "#D85842" },
  { name: "Matcha", color: "#4E9B3E" },
  { name: "Butter", color: "#F4DC76" },
  { name: "Turquoise", color: "#00E5C8" },
  { name: "Burgundy", color: "#842419" },
  { name: "Salmon", color: "#F28C7A" },
  { name: "Sky Blue", color: "#4FA6D8" },
  { name: "Golden Amber", color: "#E89038" },
  { name: "Lavender", color: "#8B7EC8" },
  { name: "Rose Coral", color: "#E2536B" },
];

export default function ColorLabHUD({
  activePreset,
  onSelectPreset,
  presets,
  cardStyle,
  onChangeCardStyle,
  buttonStyle,
  onChangeButtonStyle,
  rimLight,
  onToggleRimLight,
  useCardColorBeams,
  onToggleCardColorBeams,
  stories,
  onUpdateStoryColor,
  onResetStoryColors,
  heroColor,
  onChangeHeroColor,
  brainColor,
  onChangeBrainColor,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("presets"); // "presets" | "cards" | "stories" | "environment"
  const [copied, setCopied] = useState(false);

  const handleCopyConfig = () => {
    const config = {
      cardStyle,
      buttonStyle,
      rimLight,
      useCardColorBeams,
      stories: stories.map((s) => ({ id: s.id, category: s.category, color: s.color })),
      heroColor,
      brainColor,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 999999,
        maxWidth: isOpen ? 420 : 170,
        width: "100%",
        maxHeight: isOpen ? "85vh" : "auto",
        display: "flex",
        flexDirection: "column",
        background: "rgba(12, 16, 30, 0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1.5px solid rgba(255, 255, 255, 0.16)",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(216, 88, 66, 0.2)",
        borderRadius: 20,
        color: "#f3eee3",
        fontFamily: "var(--font-mono, monospace)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "auto",
        overflow: "hidden",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: isOpen ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          background: "rgba(18, 24, 44, 0.8)",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              display: "inline-block",
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#D85842",
              boxShadow: "0 0 12px #D85842",
            }}
          />
          <div>
            <strong style={{ fontSize: 12.5, letterSpacing: "0.08em", textTransform: "uppercase", display: "block" }}>
              🎨 Color & Card Lab
            </strong>
            <span style={{ fontSize: 10, color: "#8d93ab" }}>
              {isOpen ? "Testing Mode Active" : "Click to expand"}
            </span>
          </div>
        </div>

        <button
          type="button"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#d1d5e5",
            fontSize: 11,
            borderRadius: 8,
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          {isOpen ? "Tutup ▾" : "Buka ▴"}
        </button>
      </div>

      {isOpen && (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", padding: "14px 18px 18px" }}>
          {/* Navigation Tabs */}
          <div
            style={{
              display: "flex",
              gap: 6,
              background: "rgba(0, 0, 0, 0.4)",
              padding: 4,
              borderRadius: 12,
              marginBottom: 14,
            }}
          >
            {[
              { id: "presets", label: "Presets" },
              { id: "cards", label: "Gaya Card" },
              { id: "stories", label: "8 Kartu" },
              { id: "environment", label: "Env / Otak" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  border: "none",
                  background: activeTab === tab.id ? "rgba(255, 255, 255, 0.16)" : "transparent",
                  color: activeTab === tab.id ? "#ffffff" : "#989eb6",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PRESETS */}
          {activeTab === "presets" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 11, color: "#9da3bc", margin: "0 0 6px", lineHeight: 1.4 }}>
                Pilih tema instan sesuai konsep client:
              </p>

              {Object.entries(presets).map(([key, p]) => {
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectPreset(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: isActive
                        ? `1.5px solid ${p.signalAccent || "#D85842"}`
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      background: isActive
                        ? "rgba(216, 88, 66, 0.15)"
                        : "rgba(255, 255, 255, 0.04)",
                      color: isActive ? "#ffffff" : "#c4c8d8",
                      fontSize: 11.5,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", color: isActive ? "#FFF7DF" : "inherit" }}>
                        {p.name}
                      </strong>
                      <span style={{ fontSize: 10, color: "#8d93ab" }}>{p.tagline}</span>
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: p.threads1 }} />
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: p.spinalTrunk }} />
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: p.signalAccent }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: GAYA KARTU (CARD STYLE) */}
          {activeTab === "cards" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: "#8d93ab", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  1. Tampilan Background & Glow Kartu
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    { id: "narupa", label: "🎨 Narupa Warm Clay", desc: "Terracotta gradient, warm aura" },
                    { id: "vibrant", label: "🌈 Vibrant Neon", desc: "Full colorful & high saturation" },
                    { id: "tinted", label: "💡 Tinted Glow", desc: "Dark with colored top aura" },
                    { id: "default", label: "🌑 Dark Obsidian", desc: "Original subtle dark" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => onChangeCardStyle(style.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: cardStyle === style.id ? "1.5px solid #D85842" : "1px solid rgba(255, 255, 255, 0.1)",
                        background: cardStyle === style.id ? "rgba(216, 88, 66, 0.2)" : "rgba(255, 255, 255, 0.04)",
                        color: cardStyle === style.id ? "#ffffff" : "#c4c8d8",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <strong style={{ fontSize: 11, display: "block" }}>{style.label}</strong>
                      <span style={{ fontSize: 9.5, color: "#8d93ab" }}>{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "#8d93ab", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  2. Gaya Tombol CTA (Get Started)
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { id: "solid", label: "Solid Vibrant Fill" },
                    { id: "glow", label: "Neon Glow Pill" },
                    { id: "subtle", label: "Subtle Gray" },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => onChangeButtonStyle(btn.id)}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: 8,
                        fontSize: 10.5,
                        border: buttonStyle === btn.id ? "1px solid #D85842" : "1px solid rgba(255, 255, 255, 0.1)",
                        background: buttonStyle === btn.id ? "rgba(216, 88, 66, 0.2)" : "rgba(255, 255, 255, 0.04)",
                        color: buttonStyle === btn.id ? "#ffffff" : "#b0b4c8",
                        cursor: "pointer",
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11 }}>✨ Buttery Cream Rim Light (Narupa spec)</span>
                  <input
                    type="checkbox"
                    checked={rimLight}
                    onChange={(e) => onToggleRimLight(e.target.checked)}
                    style={{ accentColor: "#D85842", cursor: "pointer" }}
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11 }}>⚡ Multi-Color Spinal Beams (Sesuai Card)</span>
                  <input
                    type="checkbox"
                    checked={useCardColorBeams}
                    onChange={(e) => onToggleCardColorBeams(e.target.checked)}
                    style={{ accentColor: "#D85842", cursor: "pointer" }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: 8 KARTU CERITA (INDIVIDUAL STORY COLORS) */}
          {activeTab === "stories" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 11, color: "#9da3bc", margin: 0 }}>
                  Ubah warna spesifik masing-masing kartu:
                </p>
                <button
                  type="button"
                  onClick={onResetStoryColors}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#D85842",
                    fontSize: 10,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset Warna
                </button>
              </div>

              {/* Palette swatches shortcuts */}
              <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: 8, borderRadius: 10 }}>
                <span style={{ fontSize: 9.5, color: "#8d93ab", display: "block", marginBottom: 5 }}>
                  Palet Cepat Narupa (klik swatch untuk salin/jadikan inspirasi):
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {NARUPA_SWATCHES.map((sw) => (
                    <div
                      key={sw.name}
                      title={`${sw.name}: ${sw.color}`}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: sw.color,
                        cursor: "pointer",
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: `0 2px 6px ${sw.color}55`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
                {stories.map((s, idx) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      background: "rgba(255, 255, 255, 0.04)",
                      borderRadius: 8,
                      borderLeft: `4px solid ${s.color}`,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{s.category}</span>
                      <span style={{ fontSize: 9, color: "#8d93ab" }}>{s.title}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="color"
                        value={s.color}
                        onChange={(e) => onUpdateStoryColor(idx, e.target.value)}
                        style={{
                          width: 26,
                          height: 26,
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          background: "transparent",
                        }}
                      />
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: s.color, width: 55 }}>
                        {s.color}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ENVIRONMENT & OTAK */}
          {activeTab === "environment" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 11, color: "#9da3bc", margin: 0 }}>
                Kustomisasi elemen global lingkungan & otak:
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255, 255, 255, 0.04)", borderRadius: 10 }}>
                <span style={{ fontSize: 11 }}>Aksen Hero / Eyebrow</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={heroColor}
                    onChange={(e) => onChangeHeroColor(e.target.value)}
                    style={{ width: 26, height: 26, border: "none", borderRadius: 6, cursor: "pointer", background: "transparent" }}
                  />
                  <span style={{ fontSize: 10 }}>{heroColor}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255, 255, 255, 0.04)", borderRadius: 10 }}>
                <span style={{ fontSize: 11 }}>Warna Utama Otak SVG</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={brainColor}
                    onChange={(e) => onChangeBrainColor(e.target.value)}
                    style={{ width: 26, height: 26, border: "none", borderRadius: 6, cursor: "pointer", background: "transparent" }}
                  />
                  <span style={{ fontSize: 10 }}>{brainColor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div
            style={{
              marginTop: 14,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 10.5,
            }}
          >
            <button
              type="button"
              onClick={handleCopyConfig}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: copied ? "rgba(78, 155, 62, 0.3)" : "rgba(255, 255, 255, 0.08)",
                border: copied ? "1px solid #4E9B3E" : "1px solid rgba(255, 255, 255, 0.14)",
                color: copied ? "#8AE079" : "#ffffff",
                padding: "6px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 10,
                transition: "all 0.2s ease",
              }}
            >
              <span>{copied ? "✓ Copied!" : "📋 Copy Config"}</span>
            </button>

            <Link
              href="/"
              style={{
                color: "#D85842",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 11,
              }}
            >
              ← Ke Home Asli
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
