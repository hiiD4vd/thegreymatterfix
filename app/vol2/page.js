import PaperCards from "@/components/PaperCards";
import HeroSection from "@/components/HeroSection";

export const metadata = {
  title: "The Grey Matter - Vol. 01 - Card View",
  description: "Little animated stories exploring how the brain reacts to drugs, technology, stress and more.",
};

export default function Vol2Page() {
  return (
    <>
      <HeroSection />
      <PaperCards />

      <footer className="site-footer">
        The Grey Matter — a short-film series on the everyday brain.
      </footer>
    </>
  );
}
