"use client";

import SmoothScroll from "./SmoothScroll";
import GradualBlur from "./GradualBlur";
import StoryRouteCover from "./StoryRouteCover";

export default function V1Shell({ children }) {
  return (
    <SmoothScroll>
      {children}
      <StoryRouteCover />
      <GradualBlur
        target="page"
        position="bottom"
        height="8rem"
        strength={3}
        divCount={4}
        curve="bezier"
        exponential
        opacity={1}
        zIndex={50}
      />
    </SmoothScroll>
  );
}
