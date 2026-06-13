import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["700", "800"] });

export const metadata: Metadata = {
  title: "Permit Pulse | GA Building Permit Alerts",
  description: "Get instant alerts when new building permits are filed across 37 Georgia markets — Hall, Gwinnett, Forsyth, DeKalb, Bryan, Cherokee, Effingham, Fayette, Henry, Coweta, Glynn, Gordon, Clayton, Barrow, Jackson, Houston, Dawson, Morgan, and Bulloch County — and Atlanta, Savannah, Alpharetta, Johns Creek, Sandy Springs, Augusta, Smyrna, Cartersville, Austell, Gainesville, Oakwood, Marietta, LaGrange, Roswell, Lawrenceville, Perry, Flowery Branch, and Dallas, GA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        {/* Plain <script> (not next/script) so the tag renders into the SSR HTML —
            Ahrefs' install checker reads raw HTML and won't see a client-injected tag */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="eDaU8I4k8YTPmKRwx/mQqg" async />
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18204694435" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18204694435');
        `}</Script>
      </head>
      <body className="min-h-full bg-white text-gray-900">{children}</body>
    </html>
  );
}
