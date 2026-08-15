import type { Metadata } from "next";
import { Noto_Serif_Bengali, Noto_Sans_Bengali, IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["500", "600", "700"],
  variable: "--noto-serif-bengali",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--noto-sans-bengali",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--ibm-plex-mono",
  display: "swap",
});

const SITE_URL = "https://bdsorkarichakri.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "বিডি সরকারি চাকরি — বাংলাদেশের সরকারি চাকরির সার্কুলার",
    template: "%s | বিডি সরকারি চাকরি",
  },
  description:
    "বাংলাদেশের সকল সরকারি চাকরির বিজ্ঞপ্তি, নতুন সার্কুলার, শেষ হচ্ছে শীঘ্রই এমন চাকরি এবং পরীক্ষার নোটিশ একসাথে খুঁজুন। যাচাইকৃত অফিসিয়াল সূত্র থেকে সংগৃহীত তথ্য।",
  keywords: [
    "সরকারি চাকরি",
    "government jobs in Bangladesh",
    "bd job circular",
    "government job circular today",
    "latest government jobs bangladesh",
    "closing soon government jobs",
    "exam notices bangladesh",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: SITE_URL,
    siteName: "বিডি সরকারি চাকরি",
    title: "বিডি সরকারি চাকরি — বাংলাদেশের সরকারি চাকরির সার্কুলার",
    description:
      "বাংলাদেশের সকল সরকারি চাকরির বিজ্ঞপ্তি একসাথে খুঁজুন — নতুন সার্কুলার, ক্যাটাগরি অনুযায়ী চাকরি, এবং পরীক্ষার নোটিশ।",
  },
  twitter: {
    card: "summary_large_image",
    title: "বিডি সরকারি চাকরি — বাংলাদেশের সরকারি চাকরির সার্কুলার",
    description:
      "বাংলাদেশের সকল সরকারি চাকরির বিজ্ঞপ্তি একসাথে খুঁজুন — নতুন সার্কুলার, ক্যাটাগরি অনুযায়ী চাকরি, এবং পরীক্ষার নোটিশ।",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "বিডি সরকারি চাকরি",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/jobs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="bn" className={`${notoSerifBengali.variable} ${notoSansBengali.variable} ${ibmPlexMono.variable}`}>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-primary text-paper px-4 py-2 rounded"
        >
          মূল কনটেন্টে যান
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
