import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/motion/SmoothScrollProvider";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keeelai | Immersive K-12 Subject Simulator for Classrooms",
  description: "Empower teachers and inspire children with Keeelai's interactive virtual simulations across math, science, history, geography, and grammar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://keeelai.com/#organization",
              "name": "Keeelai",
              "url": "https://keeelai.com",
              "logo": "https://keeelai.com/favicon.ico"
            })
          }}
        />
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://keeelai.com/#website",
              "url": "https://keeelai.com",
              "name": "Keeelai",
              "publisher": {
                "@id": "https://keeelai.com/#organization"
              }
            })
          }}
        />
        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "@id": "https://keeelai.com/#webapp",
              "url": "https://keeelai.com",
              "name": "Keeelai Simulation Player",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
        {/* FAQPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "@id": "https://keeelai.com/#faq",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Who is Keeelai designed for?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Keeelai is designed for K-12 science and math teachers looking to boost classroom engagement, and parents wanting to help children visualize abstract concepts."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does the immersive simulation player help children learn?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "By turning passive reading into active visualization. Children learn by dragging variables and immediately seeing scientific forces react, which improves long-term memory retention."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can teachers use Keeelai in their classroom lessons?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. Teachers can project our interactive simulations on smartboards to explain complex processes like acid-base neutralizations or mechanical gear systems."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do children need any scientific background to start?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. The immersive player features intuitive, visual controls that allow children to safely explore concepts at their own pace."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What subjects does Keeelai cover?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our visual lesson library covers major science and mathematics modules, including physics gravity labs, chemistry reactions, and mechanical forces."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is there school or curriculum alignment?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Our interactive lessons are structured around standard science curriculums to support and reinforce what children learn in school."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
