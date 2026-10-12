import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://www.the-grey-matter.com"),
  title: "The Grey Matter — A Series of Short Films",
  description: "Little stories about your brain, and the things that shape it.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "The Grey Matter",
    title: "The Grey Matter — A Series of Short Films",
    description: "Little stories about your brain, and the things that shape it.",
    images: [{
      url: "/og-grey-matter.jpg",
      width: 1200,
      height: 630,
      alt: "The Grey Matter — a series of short films about the brain",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Grey Matter — A Series of Short Films",
    description: "Little stories about your brain, and the things that shape it.",
    images: ["/og-grey-matter.jpg"],
  },
  robots: { index: true, follow: true },
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
        <link href="https://fonts.cdnfonts.com/css/edo" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}