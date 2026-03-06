"use client";

import { useCallback, useState } from "react";
import type { Document } from "@/types/document";

function getFirstHeading(content: string): string | null {
  const match = content.match(/^#{1,6}\s+(.+)$/m);
  return match ? match[1].replace(/#+\s*$/, "").trim() : null;
}

interface SearchProps {
  documents: Document[];
  onSelect: (doc: Document) => void;
}

export function Search({ documents, onSelect }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Document[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const lower = q.toLowerCase();
      const matches = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(lower) ||
          doc.content.toLowerCase().includes(lower)
      );
      setResults(matches.slice(0, 8));
      setIsOpen(true);
    },
    [documents]
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-2 text-zinc-500"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className="w-full bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-zinc-500"
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {results.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => {
                onSelect(doc);
                setIsOpen(false);
                setQuery("");
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <span className="font-medium">
                {getFirstHeading(doc.content) ?? doc.title}
              </span>
              <span className="ml-1 block truncate text-zinc-500 dark:text-zinc-400">
                {doc.content.slice(0, 80).replace(/\n/g, " ")}...
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
