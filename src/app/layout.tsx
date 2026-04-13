import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Nav from "../components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToneOut — Police, Fire & EMS Scanner for iOS",
  description:
    "Ad-free police, fire & EMS scanner app with Dual Listen and Push to Talk. Built by a firefighter. iOS.",
  openGraph: {
    title: "ToneOut — Police, Fire & EMS Scanner for iOS",
    description:
      "Ad-free police, fire & EMS scanner app with Dual Listen and Push to Talk. Built by a firefighter. iOS.",
    siteName: "ToneOut",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-textSecondary antialiased font-sans">
        <Nav />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
