import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Quicksand, Space_Mono, Quantico } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

const quantico = Quantico({
  subsets: ["latin"],
  variable: "--font-quantico",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Archon | NST-SDC",
  description: "Dev Club Crash Course Leaderboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${quicksand.variable} ${spaceMono.variable} ${quantico.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
