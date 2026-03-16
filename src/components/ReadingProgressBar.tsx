"use client";

import { useEffect, useState } from "react";

interface ReadingProgressBarProps {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

export function ReadingProgressBar({ scrollContainerRef }: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      setProgress(max <= 0 ? 0 : Math.min(1, scrollTop / max));
    };

    el.addEventListener("scroll", update, { passive: true });
    update();
    return () => el.removeEventListener("scroll", update);
  }, [scrollContainerRef]);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-muted/50" aria-hidden>
      <div
        className="h-full bg-accent transition-[width] duration-75"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
