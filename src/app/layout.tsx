import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
