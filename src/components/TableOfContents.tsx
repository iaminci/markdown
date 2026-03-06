"use client";

import { useMemo } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/#+\s*$/, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-0">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        On this page
      </h3>
      <ul className="space-y-1 border-l border-zinc-200 pl-3 dark:border-zinc-700">
        {headings.map(({ id, text, level }) => (
          <li
            key={id}
            style={{ paddingLeft: `${(level - 1) * 8}px` }}
            className="text-sm"
          >
            <a
              href={`#${id}`}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
