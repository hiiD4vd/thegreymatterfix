"use client";

import { useSearchParams } from "next/navigation";

export default function A24Frame() {
  const searchParams = useSearchParams();
  const returningToMap = searchParams.get("return") === "map";
  return (
    <iframe
      title="The Grey Matter Version 2"
      src={`/v2-a24/index.html${returningToMap ? "?return=map" : ""}`}
      style={{ display: "block", width: "100vw", height: "100dvh", border: 0, background: "#000" }}
    />
  );
}
