import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${fraunces.variable} ${plex.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--ink)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
