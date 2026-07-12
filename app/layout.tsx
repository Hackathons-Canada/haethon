import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Space_Grotesk } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  weight: ["500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hackathons North America",
  description: "Discover, track, and organize hackathons across North America.",
};

// The app is dark-only. Lock the theme in before hydration so there's no flash.
const themeInitScript = `
(() => {
  try {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    document.documentElement.style.colorScheme = "dark";
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${plexMono.variable} ${newsreader.variable} h-full bg-[#141414]`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-white font-sans text-navy antialiased selection:bg-cabernet/30 selection:text-white dark:bg-[#141414] dark:text-wheat motion-safe:[&_*]:transition-[color,border-color,background-color,opacity] motion-safe:[&_*]:duration-[160ms] motion-safe:[&_*]:ease-out">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
