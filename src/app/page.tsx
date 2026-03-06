"use client";

import { useCallback, useEffect, useState } from "react";
import type { Document } from "@/types/document";
import {
  getDocuments,
  addDocument,
  deleteDocument,
} from "@/lib/storage";
import { EmptyState } from "@/components/EmptyState";
import { Sidebar } from "@/components/Sidebar";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TableOfContents } from "@/components/TableOfContents";

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);

  const refresh = useCallback(() => {
    setDocuments(getDocuments());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (documents.length > 0 && !currentDoc) {
      setCurrentDoc(documents[0]);
    }
    if (currentDoc && !documents.find((d) => d.id === currentDoc.id)) {
      setCurrentDoc(documents[0] ?? null);
    }
  }, [documents, currentDoc]);

  const handleAddDocument = useCallback((title: string, content: string) => {
    const doc = addDocument({ title, content });
    setDocuments(getDocuments());
    setCurrentDoc(doc);
  }, []);

  const handleDeleteDocument = useCallback((id: string) => {
    deleteDocument(id);
    const updated = getDocuments();
    setDocuments(updated);
    setCurrentDoc((prev) => (prev?.id === id ? updated[0] ?? null : prev));
  }, []);

  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950">
      <Sidebar
        documents={documents}
        currentId={currentDoc?.id ?? null}
        onSelectDocument={setCurrentDoc}
        onDeleteDocument={handleDeleteDocument}
        onAddDocument={handleAddDocument}
      />

      <main className="flex flex-1 overflow-auto">
        <div className="min-w-0 flex-1 px-8 py-8 print:px-0">
          {currentDoc ? (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex items-center justify-between print:mb-4">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {currentDoc.title}
                </h1>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 print:hidden"
                >
                  Print
                </button>
              </div>
              <MarkdownRenderer content={currentDoc.content} />
            </div>
          ) : (
            <EmptyState onLoadSample={handleAddDocument} />
          )}
        </div>

        {currentDoc && (
          <div className="hidden w-48 shrink-0 px-6 py-8 lg:block print:hidden">
            <TableOfContents content={currentDoc.content} />
          </div>
        )}
      </main>
    </div>
  );
}
