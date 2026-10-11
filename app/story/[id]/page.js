"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";

export default function StoryPage({ params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const fromV2 = searchParams.get("from") === "v2";

  return (
    <main style={{ width: "100vw", height: "100dvh", overflow: "hidden", background: "#111" }}>
      <iframe
        title="The Grey Matter story"
        src={`/story-frame/${encodeURIComponent(id)}${fromV2 ? "?from=v2" : ""}`}
        onLoad={() => window.dispatchEvent(new Event("gm-story-transition-ready"))}
        style={{ border: 0, display: "block", width: "100vw", height: "100dvh", background: "transparent" }}
      />
    </main>
  );
}
