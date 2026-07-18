"use client";

import { ClerkProvider } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const PostHogBootstrap = dynamic(
  () => import("@/components/providers/posthog-provider").then((module) => module.PostHogBootstrap),
  { ssr: false }
);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <PostHogBootstrap />
      {children}
    </ClerkProvider>
  );
}
