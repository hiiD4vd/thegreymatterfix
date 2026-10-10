"use client";
import { CardContainer, CardBody, CardItem } from "@/components/ui/card-3d";

/**
 * Demo Card3D — contoh pakai CardContainer + CardBody + CardItem
 * 
 * Cara pakai:
 *   <Card3DDemo />
 * 
 * translateZ makin besar = makin "timbul" saat hover
 */
export default function Card3DDemo({
  title = "The Chemical Shortcut",
  category = "Drugs",
  blurb = "How substances hijack the brain's reward circuitry.",
  color = "#E8A33D",
}) {
  return (
    <CardContainer containerClass="w-full">
      <CardBody
        className="relative rounded-2xl border p-6 cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: `${color}44`,
          boxShadow: `0 0 32px 0 ${color}22`,
        }}
      >
        {/* Badge kategori — paling timbul (translateZ tinggi) */}
        <CardItem translateZ={60} className="mb-4">
          <span
            className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: `${color}33`, color }}
          >
            {category}
          </span>
        </CardItem>

        {/* Judul — timbul sedang */}
        <CardItem translateZ={40} as="h3" className="text-xl font-semibold text-white mb-2">
          {title}
        </CardItem>

        {/* Deskripsi — sedikit timbul */}
        <CardItem translateZ={20} className="text-sm text-gray-400 mb-6">
          {blurb}
        </CardItem>

        {/* Tombol Watch — paling depan */}
        <CardItem translateZ={80}>
          <button
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full transition-colors"
            style={{
              background: `${color}22`,
              color,
              border: `1px solid ${color}55`,
            }}
          >
            <svg viewBox="0 0 10 10" width="10" height="10" fill={color}>
              <path d="M1 0.5 9 5 1 9.5z"/>
            </svg>
            Watch
          </button>
        </CardItem>

        {/* Glow orb di background — paling belakang (translateZ negatif) */}
        <CardItem
          translateZ={-20}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color}18, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      </CardBody>
    </CardContainer>
  );
}