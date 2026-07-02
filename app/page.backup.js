import StoryNetwork from "@/components/StoryNetwork";
import WebThreadsWrapper from "@/components/WebThreadsWrapper";
import HeroSection from "@/components/HeroSection";

export const metadata = {
  title: "The Grey Matter - little stories about your brain",
  description: "Little animated stories exploring how the brain reacts to drugs, technology, stress and more.",
};

export default function HomePage() {
  return (
    <main className="page-root">
      {/* WebThreads: absolute, hanya cover 100vh teratas, tidak bikin container baru */}
      <WebThreadsWrapper />

      {/* Semua konten flow normal dalam satu container */}
      <HeroSection />
      <StoryNetwork />

      <footer className="site-footer">
        The Grey Matter - a short-film series on the everyday brain.
      </footer>
    </main>
  );
}