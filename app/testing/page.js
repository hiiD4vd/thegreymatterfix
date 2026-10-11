"use client";

import { useState } from "react";
import WebThreadsWrapperTest from "@/components/v1/testing/WebThreadsWrapperTest";
import HeroSectionTest from "@/components/v1/testing/HeroSectionTest";
import StoryNetworkWebGLTest from "@/components/v1/testing/StoryNetworkWebGLTest";
import ColorLabHUD from "@/components/v1/testing/ColorLabHUD";
import { STORIES_TESTING } from "@/lib/v1/stories-testing";

// Palet Warna Referensi Narupa untuk 8 Kartu
const NARUPA_STORY_PALETTE = {
  drugs: "#E89038",        // Warm Golden Amber (Sirup / Lampu Belajar Hangat)
  pornography: "#D85842",  // Terracotta Red / Signature Skin Tone
  technology: "#4E9B3E",   // Matcha / Olive Green (Buku Catatan / Kelas)
  stress: "#842419",       // Deep Warm Burgundy (Bayangan Emosional)
  "social-media": "#00E5C8", // Vivid Turquoise / Sky (Kontras Profil & Feed)
  sleep: "#6C6FC4",        // Soft Lavender Indigo (Malam & Sunyi)
  gaming: "#F4DC76",       // Butter Yellow (Lampu Kamar)
  anxiety: "#F28C7A",      // Warm Peach / Salmon (Kuku & Aksen Pipi)
};

const DEFAULT_STORY_PALETTE = {
  drugs: "#E8A33D",
  pornography: "#E2536B",
  technology: "#2FA5A0",
  stress: "#8B7EC8",
  "social-media": "#4FA6D8",
  sleep: "#6C6FC4",
  gaming: "#8C9B4E",
  anxiety: "#D9713C",
};

const VIBRANT_STORY_PALETTE = {
  drugs: "#FF9F1C",
  pornography: "#FF3366",
  technology: "#2EC4B6",
  stress: "#9B5DE5",
  "social-media": "#00BBF9",
  sleep: "#7209B7",
  gaming: "#06D6A0",
  anxiety: "#F15BB5",
};

export const PRESETS = {
  narupa: {
    name: "🎨 Narupa Style (Sesuai Referensi Client)",
    tagline: "Terracotta #D85842, Matcha #4E9B3E, Butter #F4DC76 & Buttery Rims",
    bg: "#131724",
    threads1: "#D85842",
    threads2: "#F4DC76",
    threads3: "#FFF7DF",
    threadsBg: "#131724",
    signalAccent: "#D85842",
    brainFill: "#D85842",
    brainShade: "#842419",
    spinalTrunk: "#F4DC76",
    spinalAura: "#D85842",
    branchBeams: "#F4DC76",
    cardStyle: "narupa",
    buttonStyle: "solid",
    rimLight: true,
    useCardColorBeams: false,
    palette: NARUPA_STORY_PALETTE,
  },
  vibrant: {
    name: "🌈 Ultra Colorful Chroma",
    tagline: "Semua kartu full warna jenuh, neon glow borders & multi-color beams",
    bg: "#0b0e1a",
    threads1: "#FF3366",
    threads2: "#00BBF9",
    threads3: "#FFFFFF",
    threadsBg: "#0b0e1a",
    signalAccent: "#FF9F1C",
    brainFill: "#FF3366",
    brainShade: "#801030",
    spinalTrunk: "#FF9F1C",
    spinalAura: "#FF3366",
    branchBeams: "#00BBF9",
    cardStyle: "vibrant",
    buttonStyle: "glow",
    rimLight: true,
    useCardColorBeams: true,
    palette: VIBRANT_STORY_PALETTE,
  },
  tinted: {
    name: "💡 Tinted Glow Elegance",
    tagline: "Background lembut bertransparansi dengan aksen warna kartu kaya",
    bg: "#101424",
    threads1: "#E8A33D",
    threads2: "#ffd166",
    threads3: "#fff8e0",
    threadsBg: "#101424",
    signalAccent: "#ff6b4a",
    brainFill: "#d9847a",
    brainShade: "#c56a5e",
    spinalTrunk: "#ffd166",
    spinalAura: "#E8A33D",
    branchBeams: "#ffd166",
    cardStyle: "tinted",
    buttonStyle: "glow",
    rimLight: false,
    useCardColorBeams: false,
    palette: DEFAULT_STORY_PALETTE,
  },
  default: {
    name: "🌑 Default The Grey Matter",
    tagline: "Tema asli website saat ini (Dark Obsidian)",
    bg: "#12172b",
    threads1: "#E8A33D",
    threads2: "#ffd166",
    threads3: "#fff8e0",
    threadsBg: "#12172b",
    signalAccent: "#ff6b4a",
    brainFill: "#d9847a",
    brainShade: "#c56a5e",
    spinalTrunk: "#ffd166",
    spinalAura: "#E8A33D",
    branchBeams: "#ffd166",
    cardStyle: "default",
    buttonStyle: "subtle",
    rimLight: false,
    useCardColorBeams: false,
    palette: DEFAULT_STORY_PALETTE,
  },
};

export default function TestingPage() {
  const [activePresetKey, setActivePresetKey] = useState("narupa"); // Langsung aktif ke Narupa style sesuai request client!

  // Active styles that can be overridden live
  const [cardStyle, setCardStyle] = useState("narupa");
  const [buttonStyle, setButtonStyle] = useState("solid");
  const [rimLight, setRimLight] = useState(true);
  const [useCardColorBeams, setUseCardColorBeams] = useState(false);

  // Active theme settings
  const [bg, setBg] = useState(PRESETS.narupa.bg);
  const [threads1, setThreads1] = useState(PRESETS.narupa.threads1);
  const [threads2, setThreads2] = useState(PRESETS.narupa.threads2);
  const [threads3, setThreads3] = useState(PRESETS.narupa.threads3);
  const [signalAccent, setSignalAccent] = useState(PRESETS.narupa.signalAccent);
  const [brainFill, setBrainFill] = useState(PRESETS.narupa.brainFill);
  const [brainShade, setBrainShade] = useState(PRESETS.narupa.brainShade);
  const [spinalTrunk, setSpinalTrunk] = useState(PRESETS.narupa.spinalTrunk);
  const [spinalAura, setSpinalAura] = useState(PRESETS.narupa.spinalAura);
  const [branchBeams, setBranchBeams] = useState(PRESETS.narupa.branchBeams);

  // Individual Story Cards Data (Initialized with Narupa's colorful palette)
  const [stories, setStories] = useState(() => {
    return STORIES_TESTING.map((s) => ({
      ...s,
      color: NARUPA_STORY_PALETTE[s.id] || s.color,
    }));
  });

  const handleSelectPreset = (key) => {
    const p = PRESETS[key];
    if (!p) return;
    setActivePresetKey(key);
    setBg(p.bg);
    setThreads1(p.threads1);
    setThreads2(p.threads2);
    setThreads3(p.threads3);
    setSignalAccent(p.signalAccent);
    setBrainFill(p.brainFill);
    setBrainShade(p.brainShade);
    setSpinalTrunk(p.spinalTrunk);
    setSpinalAura(p.spinalAura);
    setBranchBeams(p.branchBeams);
    setCardStyle(p.cardStyle);
    setButtonStyle(p.buttonStyle);
    setRimLight(p.rimLight);
    setUseCardColorBeams(p.useCardColorBeams);

    if (p.palette) {
      setStories((prev) =>
        prev.map((s) => ({
          ...s,
          color: p.palette[s.id] || s.color,
        }))
      );
    }
  };

  const handleUpdateStoryColor = (index, newColor) => {
    setStories((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], color: newColor };
      return next;
    });
  };

  const handleResetStoryColors = () => {
    setStories((prev) =>
      prev.map((s) => ({
        ...s,
        color: NARUPA_STORY_PALETTE[s.id] || s.color,
      }))
    );
  };

  return (
    <main
      className="page-root"
      style={{
        backgroundColor: bg,
        transition: "background-color 0.4s ease",
      }}
    >
      {/* 1. WebThreads WebGL Shader */}
      <WebThreadsWrapperTest
        color1={threads1}
        color2={threads2}
        color3={threads3}
        backgroundColor={bg}
      />

      {/* 2. Konten Mengambang di Atas WebGL */}
      <div style={{ position: "relative", zIndex: 10, pointerEvents: "none" }}>
        <HeroSectionTest
          accentColor={signalAccent}
          eyebrowColor={signalAccent}
        />

        {/* Otak & Jaringan Saraf Sinaptik + Kartu 3D Colorful */}
        <div className="network-pull-wrap">
          <StoryNetworkWebGLTest
            stories={stories}
            brainFill={brainFill}
            brainShade={brainShade}
            trunkColor={spinalTrunk}
            trunkAura={spinalAura}
            beamColor={branchBeams}
            useStoryCardColorForBeams={useCardColorBeams}
            cardStyle={cardStyle}
            buttonStyle={buttonStyle}
            rimLight={rimLight}
          />
        </div>
      </div>

      <footer
        className="site-footer"
        style={{ pointerEvents: "auto", position: "relative", zIndex: 10 }}
      >
        The Grey Matter — Sandbox Pengujian Warna & Desain Kartu Colorful.
      </footer>

      {/* 3. Floating Control Center: Live Color & Card Lab HUD */}
      <ColorLabHUD
        activePreset={activePresetKey}
        onSelectPreset={handleSelectPreset}
        presets={PRESETS}
        cardStyle={cardStyle}
        onChangeCardStyle={setCardStyle}
        buttonStyle={buttonStyle}
        onChangeButtonStyle={setButtonStyle}
        rimLight={rimLight}
        onToggleRimLight={setRimLight}
        useCardColorBeams={useCardColorBeams}
        onToggleCardColorBeams={setUseCardColorBeams}
        stories={stories}
        onUpdateStoryColor={handleUpdateStoryColor}
        onResetStoryColors={handleResetStoryColors}
        heroColor={signalAccent}
        onChangeHeroColor={setSignalAccent}
        brainColor={brainFill}
        onChangeBrainColor={setBrainFill}
      />
    </main>
  );
}
