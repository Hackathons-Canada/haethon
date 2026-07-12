"use client";

import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { useEffect } from "react";

// Captures a $pageview on every App Router navigation. Next.js does client-side
// route changes without a full reload, so PostHog's built-in pageview tracking
// is disabled and we fire it manually here. Keyed on pathname only — query-param
// changes (e.g. filter tweaks on /hackathons) are not new pageviews, though the
// captured URL still includes whatever search string is current at fire time.
export function PostHogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !posthog.__loaded) {
      return;
    }

    const url = window.origin + pathname + window.location.search;

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname]);

  return null;
}
