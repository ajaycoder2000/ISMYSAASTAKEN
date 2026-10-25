import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FounderQuizLauncher from "@/components/quiz/FounderQuizLauncher";
import { SITE_URL } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f1319",
};

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
  metadataBase: new URL(SITE_URL),
  title: "Is My SaaS Taken? | Instant Market Validation for SaaS Ideas",
  description:
    "Check real competitors and real gaps for your SaaS idea in seconds. No BS.",
  keywords: [
    'SaaS idea validation',
    'market saturation checker',
    'competitor analysis tool',
    'find SaaS competitors',
    'startup gap analysis',
    'micro SaaS ideas',
    'indie hacker validation',
    'software competitor search',
    'Product Hunt alternatives',
    'startup moat analysis',
  ],
  authors: [{ name: 'IsMySaaSTaken Team', url: SITE_URL }],
  creator: 'IsMySaaSTaken',
  publisher: 'IsMySaaSTaken',
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Is My SaaS Taken? | Instant Market Validation for SaaS Ideas",
    description: "Check real competitors and real gaps for your SaaS idea in seconds. No BS.",
    url: "https://www.ismysaastaken.live/",
    siteName: "Is My SaaS Taken?",
    type: "website",
    images: [
      {
        url: "https://www.ismysaastaken.live/og-image.png",
        width: 1200,
        height: 630,
        alt: "Is My SaaS Taken? — Instant Market Validation for SaaS Ideas",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Is My SaaS Taken? | Instant Market Validation for SaaS Ideas",
    description: "Check real competitors and real gaps for your SaaS idea in seconds. No BS.",
    images: ["https://www.ismysaastaken.live/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Is My SaaS Taken?',
      description: 'Instant market validation for SaaS founders. Real competitors, real gaps, no BS.',
      publisher: {
        '@type': 'Organization',
        name: 'IsMySaaSTaken',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/icon.png`,
        },
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'Is My SaaS Taken?',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      description: 'Instant market validation for SaaS founders. Real competitors, real gaps, no BS.',
      url: SITE_URL,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ],
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-VN8XEW1LCG';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ClerkProvider>
            <Navbar />
            <main className="flex-1 relative">
              {children}
              {/* Invisible sentinel at 50% height for cheap IntersectionObserver trigger */}
              <div
                id="quiz-scroll-sentinel"
                className="absolute top-1/2 left-0 w-px h-px pointer-events-none opacity-0"
                aria-hidden="true"
              />
            </main>
            <Footer />
            <FounderQuizLauncher />
          </ClerkProvider>
        </ThemeProvider>

        {/* Lightweight Vercel Analytics */}
        <Script
          src="https://va.vercel-scripts.com/v1/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
