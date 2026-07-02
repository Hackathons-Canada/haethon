"use client";

import { PostHogProvider as Provider } from "posthog-js/react";
import posthog from "posthog-js";
import { useEffect } from "react";

import { posthogConfig } from "@/lib/analytics/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!key) {
      return;
    }

    posthog.init(key, {
      api_host: posthogConfig.apiHost,
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  }, []);

  return <Provider client={posthog}>{children}</Provider>;
}
