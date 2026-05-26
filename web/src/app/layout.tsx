import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Permit Pulse | GA Building Permit Alerts",
  description: "Get instant alerts when new building permits are filed in Hall, Gwinnett, Forsyth, and Bryan County — and the cities of Savannah and Alpharetta — GA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="eDaU8I4k8YTPmKRwx/mQqg" async={true}></script>
      </head>
      <body className="min-h-full bg-white text-gray-900">{children}</body>
    </html>
  );
}
