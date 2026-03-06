"use client";

import { useRef, useState } from "react";
import type { Document } from "@/types/document";
import { DocumentList } from "./DocumentList";
import { Search } from "./Search";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  documents: Document[];
  currentId: string | null;
  onSelectDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  onAddDocument: (title: string, content: string) => void;
}

export function Sidebar({
  documents,
  currentId,
  onSelectDocument,
  onDeleteDocument,
  onAddDocument,
}: SidebarProps) {
  const [showPaste, setShowPaste] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      const title = file.name.replace(/\.(md|markdown)$/i, "") || "Untitled";
      onAddDocument(title, content);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <aside className="flex min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 print:hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center justify-between border-b border-zinc-200 p-3 dark:border-zinc-700">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Documents
        </h2>
        <ThemeToggle />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <Search documents={documents} onSelect={onSelectDocument} />

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleUpload}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setShowPaste(!showPaste)}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Paste
          </button>
        </div>

        {showPaste && (
          <PasteInput
            onClose={() => setShowPaste(false)}
            onSubmit={onAddDocument}
          />
        )}

        <div className="mt-4">
          <DocumentList
            documents={documents}
            currentId={currentId}
            onSelect={onSelectDocument}
            onDelete={onDeleteDocument}
          />
        </div>
      </div>
    </aside>
  );
}

function PasteInput({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (title: string, content: string) => void;
}) {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(title.trim() || "Untitled", value);
    setValue("");
    setTitle("");
    onClose();
  };

  return (
    <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-800">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-2 w-full rounded border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
      />
      <textarea
        placeholder="Paste markdown here..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        className="mb-2 w-full resize-none rounded border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="rounded bg-zinc-800 px-2 py-1 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-600 dark:hover:bg-zinc-500"
        >
          Add
        </button>
      </div>
    </div>
  );
}
