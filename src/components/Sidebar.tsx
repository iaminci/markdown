"use client";

import { useRef, useState } from "react";
import type { Document } from "@/types/document";
import { DocumentList } from "./DocumentList";
import { Search } from "./Search";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

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
    <aside className="flex min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar print:hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center justify-between border-b border-sidebar-border p-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          Documents
        </h2>
        <ThemeToggle />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <Search documents={documents} onSelect={onSelectDocument} />

        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUpload}
            className="flex-1"
          >
            Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPaste(!showPaste)}
            className="flex-1"
          >
            Paste
          </Button>
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
    <Card className="mt-3">
      <CardContent className="pt-4">
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2"
        />
        <Textarea
          placeholder="Paste markdown here..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          className="mb-2"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!value.trim()}
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
