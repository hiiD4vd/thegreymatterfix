import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import GradualBlur from "@/components/GradualBlur";

export const metadata = {
  title: "The Grey Matter - little stories about your brain",
  description: "Little animated stories exploring how the brain reacts to drugs, technology, stress and more.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#12172b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400;1,6..72,500&family=Outfit:wght@400;500;600&family=Pinyon+Script&family=Plus+Jakarta+Sans:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>

        {/* Gradual Blur persis seperti konfigurasi React Bits di bagian bawah layar */}
        <GradualBlur
          target="page"
          position="bottom"
          height="8rem"
          strength={3}
          divCount={8}
          curve="bezier"
          exponential={true}
          opacity={1}
          zIndex={50}
        />
      </body>
    </html>
  );
}