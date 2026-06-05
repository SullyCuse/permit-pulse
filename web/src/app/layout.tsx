import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["700", "800"] });

export const metadata: Metadata = {
  title: "Permit Pulse | GA Building Permit Alerts",
  description: "Get instant alerts when new building permits are filed across 25 Georgia markets — Hall, Gwinnett, Forsyth, DeKalb, Bryan, Cherokee, Effingham, Camden, Franklin, Fayette, and Henry County — and Atlanta, Savannah, Alpharetta, Johns Creek, Sandy Springs, Augusta, Conyers, Smyrna, Cartersville, Austell, Bainbridge, Gainesville, Oakwood, and Marietta, GA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <Script src="https://analytics.ahrefs.com/analytics.js" data-key="eDaU8I4k8YTPmKRwx/mQqg" strategy="afterInteractive" />
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
