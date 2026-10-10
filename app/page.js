import StoryNetworkWebGL from "@/components/StoryNetworkWebGL";
import WebThreadsWrapper from "@/components/WebThreadsWrapper";
import HeroSection from "@/components/HeroSection";
import Grainient from "@/components/Grainient";
import Preloader from "@/components/Preloader";

export const metadata = {
  title: "The Grey Matter - little stories about your brain",
  description: "Little animated stories exploring how the brain reacts to drugs, technology, stress and more.",
};

export default function HomePage() {
  return (
    <main className="page-root">
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
      {/* WebThreads: absolute, hanya cover 100vh teratas */}
      <WebThreadsWrapper />

      {/* Konten: mengapung di atas WebGL */}
      <div style={{ position: "relative", zIndex: 10, pointerEvents: "none" }}>
        <HeroSection />

        {/* Otak & Kartu: mengalir setelah hero, ditarik ke atas pakai margin-top negatif (desktop) */}
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