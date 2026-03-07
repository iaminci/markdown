"use client";

import { useCallback, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import type { Document } from "@/types/document";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className="pl-8"
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-md">
          {results.map((doc) => (
            <Button
              key={doc.id}
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start px-3 py-2 font-normal"
              onClick={() => {
                onSelect(doc);
                setIsOpen(false);
                setQuery("");
              }}
            >
              <span className="flex flex-col items-start text-left">
                <span className="font-medium truncate w-full">
                  {getFirstHeading(doc.content) ?? doc.title}
                </span>
                <span className="truncate w-full text-muted-foreground text-xs">
                  {doc.content.slice(0, 80).replace(/\n/g, " ")}...
                </span>
              </span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
