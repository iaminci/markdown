"use client";

import type { Document } from "@/types/document";

function getFirstHeading(content: string): string | null {
  const match = content.match(/^#{1,6}\s+(.+)$/m);
  return match ? match[1].replace(/#+\s*$/, "").trim() : null;
}

interface DocumentListProps {
  documents: Document[];
  currentId: string | null;
  onSelect: (doc: Document) => void;
  onDelete: (id: string) => void;
}

export function DocumentList({
  documents,
  currentId,
  onSelect,
  onDelete,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No documents yet. Paste or upload markdown to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {documents.map((doc) => (
        <li key={doc.id} className="group flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelect(doc)}
            className={`flex-1 truncate rounded px-2 py-1.5 text-left text-sm ${
              currentId === doc.id
                ? "bg-zinc-200 font-medium dark:bg-zinc-700"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {getFirstHeading(doc.content) ?? doc.title}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc.id);
            }}
            className="rounded p-1 opacity-0 hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            aria-label="Delete document"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
