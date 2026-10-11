"use client";
import React, { useEffect, useRef } from "react";
import { InfiniteGridClass } from "./InfiniteGridClass";

export default function InfiniteGrid({ cardData, options = {}, onTilesLoaded, onTileClicked }) {
  const containerRef = useRef(null);
  const gridInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const defaultOptions = {
      gridCols: 4,
      gridRows: 4,
      gridGap: 0,
      tileSize: 3,
      baseCameraZ: 10,
      enablePostProcessing: true,
      postProcessParams: {
        distortionIntensity: -0.2,
        vignetteOffset: 0.0,
        vignetteDarkness: 0.0,
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      postProcessParams: {
        ...defaultOptions.postProcessParams,
        ...(options.postProcessParams || {}),
      },
    };

    const handleTileClicked = (event) => {
      if (onTileClicked) onTileClicked(event.detail);
    };

    const initGrid = async () => {
      gridInstanceRef.current = new InfiniteGridClass(
        containerRef.current,
        cardData,
        mergedOptions
      );
      await gridInstanceRef.current.init();
      if (onTilesLoaded) onTilesLoaded();
      
      containerRef.current.addEventListener("tileClicked", handleTileClicked);
    };

    initGrid();

    return () => {
      if (gridInstanceRef.current) {
        if (containerRef.current) {
          containerRef.current.removeEventListener("tileClicked", handleTileClicked);
        }
        gridInstanceRef.current.dispose();
        gridInstanceRef.current = null;
      }
    };
  }, [cardData, options, onTilesLoaded, onTileClicked]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden" }}
    />
  );
}
