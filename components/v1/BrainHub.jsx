"use client";
import Image from "next/image";

export default function BrainHub() {
  return (
    <div className="brain-hub">
      <div id="brain-anchor" style={{ display: "flex", justifyContent: "center" }}>
        <Image
          src="/brain-custom.png"
          alt="Brain Anchor"
          width={280}
          height={280}
          priority
          style={{ 
            width: "clamp(150px, 35vw, 280px)", 
            height: "auto", 
            filter: "drop-shadow(0 15px 25px rgba(0, 0, 0, 0.6))" 
          }}
        />
      </div>
    </div>
  );
}
