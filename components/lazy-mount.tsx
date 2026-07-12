"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/* Defers mounting children until the wrapper scrolls near the viewport, so
   below-fold JS stays off the critical path. The generous rootMargin starts
   loading well before the content is visible, and the caller supplies sizing
   classes (min-height / aspect ratio) so the placeholder doesn't shift layout. */
export function LazyMount({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) {
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const timeout = window.setTimeout(() => setMounted(true), 0);

      return () => window.clearTimeout(timeout);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [mounted]);

  return (
    <div className={className} ref={ref}>
      {mounted ? children : null}
    </div>
  );
}
