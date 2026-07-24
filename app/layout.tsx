import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const pillLoop =
  "url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%20200%2060%27%20preserveAspectRatio=%27none%27%3E%3Cpath%20d=%27M18%204.5C7%205%203.5%2013%204%2028c.5%2017%205%2027%2018%2027.5l155-.5c13-.5%2019-9%2019-26%200-17-6-24-18-24.5-48-1-108%201-160%200Z%27%20fill=%27none%27%20stroke=%27black%27%20stroke-width=%271.9%27%20stroke-linecap=%27round%27/%3E%3Cpath%20d=%27M20%206C9%206%205.5%2014%206%2029c.5%2015%205%2024%2017%2024.5l152-.5c12%200%2018.5-8%2018.5-24%200-15-5.5-22-17-22.5-47-1-105%20.5-156.5-.5Z%27%20fill=%27none%27%20stroke=%27black%27%20stroke-width=%27.7%27%20stroke-linecap=%27round%27%20opacity=%27.55%27/%3E%3C/svg%3E')";

const pillInteractionStyles = [
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])]:relative",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])]:isolate",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])]:transition-[border-radius,transform,color,background-color,border-color,opacity]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])]:duration-[320ms]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])]:ease-[cubic-bezier(0.2,0.75,0.25,1)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:pointer-events-none",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:absolute",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:z-2",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:inset-[-0.35rem_-0.5rem]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:bg-pine",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:content-['']",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:[clip-path:polygon(0_0,0_0,0_100%,0_100%)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:opacity-0",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:rotate-[-1.5deg]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:scale-[0.98]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:[transition-property:clip-path,opacity,transform]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:duration-[680ms]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:ease-[cubic-bezier(0.3,0.65,0.25,1)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:will-change-[clip-path,opacity,transform]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:[-webkit-mask:var(--pill-loop)_center/100%_100%_no-repeat]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true])::after]:[mask:var(--pill-loop)_center/100%_100%_no-repeat]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true]):is(:hover,:focus-visible)]:rounded-[0.625rem]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true]):is(:hover,:focus-visible)]:-translate-y-px",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true]):is(:hover,:focus-visible)::after]:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true]):is(:hover,:focus-visible)::after]:opacity-[0.78]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&_:is(button,a,[role=button]).rounded-full:not(:disabled):not([aria-disabled=true]):is(:hover,:focus-visible)::after]:scale-100",
  "motion-reduce:[&_:is(button,a,[role=button]).rounded-full]:duration-[0.01ms]",
  "motion-reduce:[&_:is(button,a,[role=button]).rounded-full::after]:transition-none",
].join(" ");

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hackathons North America",
  description: "Discover, track, and organize hackathons across North America.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} h-full bg-paper`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body
        className={`${pillInteractionStyles} min-h-full bg-paper font-sans text-ink antialiased selection:bg-pine/25 selection:text-ink motion-safe:[&_*]:transition-[color,border-color,background-color,opacity] motion-safe:[&_*]:duration-[160ms] motion-safe:[&_*]:ease-out`}
        style={{ "--pill-loop": pillLoop } as React.CSSProperties}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
