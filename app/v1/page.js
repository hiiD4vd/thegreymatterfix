import StoryNetworkWebGL from "@/components/v1/StoryNetworkWebGL";
import WebThreadsWrapper from "@/components/v1/WebThreadsWrapper";
import HeroSection from "@/components/v1/HeroSection";
import Grainient from "@/components/v1/Grainient";
import V1Shell from "@/components/v1/V1Shell";

export const metadata = {
  title: "The Grey Matter V1",
  description: "Little animated stories exploring how the brain reacts to drugs, technology, stress and more.",
};

export default function VersionOnePage() {
  return (
    <V1Shell>
      <main className="page-root">
        <Grainient
          color1="#172A4D"
          color2="#2B4E7D"
          color3="#0E1F3D"
          grainAmount={0.06}
          grainScale={1.5}
          timeSpeed={0.3}
          warpSpeed={0.4}
          lightMode={false}
        />
        <WebThreadsWrapper />
        <div style={{ position: "relative", zIndex: 10, pointerEvents: "none" }}>
          <HeroSection />
          <div className="network-pull-wrap">
            <StoryNetworkWebGL />
          </div>
        </div>
        <footer className="site-footer" style={{ pointerEvents: "auto", position: "relative", zIndex: 10 }}>
          The Grey Matter - a short-film series on the everyday brain.
        </footer>
      </main>
    </V1Shell>
  );
}
