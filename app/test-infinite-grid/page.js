"use client";

import React from "react";
import InfiniteGrid from "../../components/v1/infinite-grid/InfiniteGrid";
import { STORIES } from "../../lib/v1/stories";

export default function TestInfiniteGridPage() {
  return (
    <div style={{ width: "100%", height: "100vh", backgroundColor: "#000" }}>
      <InfiniteGrid 
        cardData={STORIES}
        options={{
          gridCols: 4,
          gridRows: 4,
          tileSize: 3,
          enablePostProcessing: true
        }}
      />
    </div>
  );
}
