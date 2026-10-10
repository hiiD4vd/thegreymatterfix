import StoryNetworkWebGL from "@/components/v2/StoryNetworkWebGL";
import WebThreadsWrapper from "@/components/v2/WebThreadsWrapper";
import HeroSection from "@/components/v2/HeroSection";
import Grainient from "@/components/v2/Grainient";
import Preloader from "@/components/v2/Preloader";
import styles from "./v2.module.css";

export const metadata = {
  title: "The Grey Matter V2 - little stories about your brain",
  description: "Version 2 homepage.",
};

// Standalone V2. Its homepage components live only in components/v2.
export default function VersionTwoPage() {
  return (
    <main className={`page-root ${styles.root}`}>
      <Preloader />
      <Grainient
        color1="#0B1021"
        color2="#1A2542"
        color3="#040714"
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
  );
}
