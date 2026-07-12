"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { PostHogProvider } from "@/components/providers/posthog-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <PostHogProvider>{children}</PostHogProvider>
    </ClerkProvider>
  );
}
