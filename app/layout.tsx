import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://official.observer"),
  title: "The Observatory — a living map of BC + AI",
  description:
    "A public, interactive living map of the BC + AI, ED + AI, and Futureproof ecosystem.",
  openGraph: {
    title: "The Observatory — a living map of BC + AI",
    description:
      "A public, interactive living map of the BC + AI, ED + AI, and Futureproof ecosystem.",
    siteName: "The Observatory",
    url: "https://official.observer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Observatory — a living map of BC + AI",
    description:
      "A public, interactive living map of the BC + AI, ED + AI, and Futureproof ecosystem.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">{children}</body>
    </html>
  );
}
