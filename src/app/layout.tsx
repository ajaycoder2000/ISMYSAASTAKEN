import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ismysaastaken.vercel.app'),
  title: "Is My SaaS Taken? — Instant Market Validation for SaaS Ideas",
  description:
    "Describe your SaaS idea, get back real competitors, market saturation, and a specific gap you could build toward. No signup required for your first scan.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Is My SaaS Taken?",
    description:
      "Instant, honest market validation for SaaS founders. Real competitors. Real gaps. No BS.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Is My SaaS Taken?",
    description:
      "Describe your SaaS idea, get back real competitors and a gap you could actually build toward.",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Is My SaaS Taken?',
  applicationCategory: 'BusinessApplication',
  description: 'Instant market validation for SaaS founders. Real competitors, real gaps, no BS.',
  url: 'https://ismysaastaken.vercel.app',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[hsl(220,15%,8%)] text-[hsl(40,20%,92%)]">
        <ClerkProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClerkProvider>
        {/* Lightweight Vercel Analytics */}
        <Script
          src="https://va.vercel-scripts.com/v1/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}