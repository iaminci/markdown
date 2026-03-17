"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    if (/^\s{4,}/.test(line) || line.startsWith("\t")) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/#+\s*$/, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      if (level <= 3) headings.push({ id, text, level });
    }
  }

  return headings;
}

export function TableOfContents({ content, scrollContainerRef }: TableOfContentsProps) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tocRef = useRef<HTMLUListElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const container = scrollContainerRef?.current ?? document;
    const scrollEl = scrollContainerRef?.current ?? document.documentElement;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActiveId(id);
          }
        }
      },
      {
        root: scrollContainerRef?.current ?? null,
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings, content, scrollContainerRef]);

  useEffect(() => {
    if (!activeId || !tocRef.current || !activeItemRef.current) return;
    const item = activeItemRef.current;
    const list = tocRef.current;
    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.bottom > listRect.bottom || itemRect.top < listRect.top) {
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeId]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-8 self-start">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </h3>
      <ul ref={tocRef} className="space-y-1 border-l border-orange-500/50 dark:[border-color:var(--dm-border)] pl-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
        {headings.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: `${(level - 1) * 8}px` }} className="text-sm">
            <a
              ref={activeId === id ? activeItemRef : null}
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              className={cn(
                "block rounded-md px-1 -ml-1 transition-colors scroll-mt-4 border-l-2 -ml-px",
                activeId === id
                  ? "border-orange-500 text-orange-600 font-medium bg-orange-500/15 dark:border-orange-400 dark:text-orange-400 dark:[color:var(--dm-text)] dark:bg-orange-500/20 dark:[background-color:var(--dm-bg)] dark:[border-color:var(--dm-text)]"
                  : "border-transparent text-zinc-700 dark:text-zinc-300 hover:text-orange-600 hover:bg-orange-500/10 dark:hover:text-orange-400 dark:hover:[background-color:var(--dm-bg)]"
              )}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
