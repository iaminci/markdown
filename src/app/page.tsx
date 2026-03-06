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
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const docs = await getDocuments();
    setDocuments(docs);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (documents.length > 0 && !currentDoc) {
      setCurrentDoc(documents[0]);
    }
    if (currentDoc && !documents.find((d) => d.id === currentDoc.id)) {
      setCurrentDoc(documents[0] ?? null);
    }
  }, [documents, currentDoc]);

  const handleAddDocument = useCallback(
    async (title: string, content: string) => {
      const doc = await addDocument({ title, content });
      const updated = await getDocuments();
      setDocuments(updated);
      setCurrentDoc(doc);
    },
    []
  );

  const handleDeleteDocument = useCallback(async (id: string) => {
    await deleteDocument(id);
    const updated = await getDocuments();
    setDocuments(updated);
    setCurrentDoc((prev) => (prev?.id === id ? updated[0] ?? null : prev));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-zinc-500 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
      <Sidebar
        documents={documents}
        currentId={currentDoc?.id ?? null}
        onSelectDocument={setCurrentDoc}
        onDeleteDocument={handleDeleteDocument}
        onAddDocument={handleAddDocument}
      />

      <main className="flex min-w-0 flex-1 overflow-hidden">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-8 py-8 print:px-0">
          {currentDoc ? (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex items-center justify-between print:mb-4">
                {currentDoc.title.toLowerCase() !== "readme" && (
                  <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {currentDoc.title}
                  </h1>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([currentDoc.content], {
                      type: "text/markdown",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${currentDoc.title.replace(/\.md$/i, "")}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="ml-auto rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  Save
                </button>
              </div>
              <MarkdownRenderer content={currentDoc.content} />
            </div>
          ) : (
            <EmptyState onLoadSample={handleAddDocument} />
          )}
        </div>

        {currentDoc && (
          <div className="hidden min-h-0 w-48 shrink-0 overflow-y-auto px-6 py-8 lg:block print:hidden">
            <TableOfContents content={currentDoc.content} />
          </div>
        )}
      </main>
    </div>
  );
}
