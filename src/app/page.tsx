"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function hashContent(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}

function getFirstHeading(content: string): string | null {
  const match = content.match(/^#{1,6}\s+(.+)$/m);
  return match ? match[1].replace(/#+\s*$/, "").trim() : null;
}
import type { Document } from "@/types/document";
import {
  getDocuments,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  DuplicateNameError,
} from "@/lib/storage";
import { EmptyState } from "@/components/EmptyState";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

const CURRENT_DOC_KEY = "md-viewer-current-doc";

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const refresh = useCallback(async () => {
    const docs = await getDocuments();
    setDocuments(docs);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (documents.length === 0) {
      setCurrentDoc(null);
      return;
    }
    if (currentDoc && !documents.find((d) => d.id === currentDoc.id)) {
      setCurrentDoc(documents[0] ?? null);
      return;
    }
    const docIdFromUrl = searchParams.get("doc");
    const docIdFromStorage =
      typeof window !== "undefined" ? localStorage.getItem(CURRENT_DOC_KEY) : null;
    const preferredId = docIdFromUrl ?? docIdFromStorage;
    const preferred = preferredId
      ? documents.find((d) => d.id === preferredId)
      : null;
    if (preferred) {
      setCurrentDoc(preferred);
    } else if (!currentDoc) {
      setCurrentDoc(documents[0]);
    }
  }, [documents, searchParams, currentDoc]);

  useEffect(() => {
    if (!currentDoc || typeof window === "undefined") return;
    localStorage.setItem(CURRENT_DOC_KEY, currentDoc.id);
    const params = new URLSearchParams(window.location.search);
    if (params.get("doc") === currentDoc.id) return;
    params.set("doc", currentDoc.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentDoc?.id, pathname, router]);

  const handleAddDocument = useCallback(
    async (
      title: string,
      content: string,
      workspaceId?: string,
      folderId?: string | null
    ) => {
      const wsId = workspaceId ?? "default";
      try {
        const doc = await addDocument(
          { title, content, workspaceId: wsId, folderId: folderId ?? null },
          { workspaceId: wsId, folderId: folderId ?? null }
        );
        const updated = await getDocuments();
        setDocuments(updated);
        setCurrentDoc(doc);
      } catch (err) {
        if (err instanceof DuplicateNameError) {
          toast.error(err.message);
        } else {
          toast.error("Failed to create document.");
        }
      }
    },
    []
  );

  const handleDeleteDocument = useCallback(async (id: string) => {
    await deleteDocument(id);
    const updated = await getDocuments();
    setDocuments(updated);
    setCurrentDoc((prev) => (prev?.id === id ? updated[0] ?? null : prev));
  }, []);

  const handleEditOpen = useCallback(() => {
    if (currentDoc) {
      setEditContent(currentDoc.content);
      setEditOpen(true);
    }
  }, [currentDoc]);

  const handleEditSave = useCallback(async () => {
    if (!currentDoc) return;
    const updated = await updateDocument(currentDoc.id, { content: editContent });
    if (updated) {
      setCurrentDoc(updated);
      await refresh();
    }
    setEditOpen(false);
  }, [currentDoc, editContent, refresh]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <Sidebar
        documents={documents}
        currentId={currentDoc?.id ?? null}
        onSelectDocument={async (doc) => {
          const fresh = await getDocument(doc.id);
          setCurrentDoc(fresh ?? doc);
          const params = new URLSearchParams(searchParams.toString());
          params.set("doc", doc.id);
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }}
        onDeleteDocument={handleDeleteDocument}
        onAddDocument={handleAddDocument}
        onRefresh={refresh}
      />

      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-8 py-8 print:px-0">
          {currentDoc ? (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex items-start justify-between gap-4 print:mb-4">
                {(() => {
                  const firstHeading = getFirstHeading(currentDoc.content);
                  const titleNorm = currentDoc.title.replace(/^#+\s*/, "").trim() || currentDoc.title;
                  const headingMatchesTitle =
                    firstHeading &&
                    titleNorm.toLowerCase() === firstHeading.toLowerCase();
                  const isReadme = /^readme(\s*\(\d+\))?$/i.test(currentDoc.title);
                  if (isReadme || headingMatchesTitle) return <div className="min-w-0 flex-1" />;
                  return (
                    <h1 className="text-2xl font-semibold text-foreground min-w-0 flex-1">
                      {currentDoc.title}
                    </h1>
                  );
                })()}
                <div className="flex shrink-0 gap-2 order-last">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-orange-500/50 focus-visible:border-orange-500 focus-visible:ring-orange-500/30 dark:border-amber-400/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/30"
                    onClick={handleEditOpen}
                  >
                    <Pencil className="mr-1.5 size-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-orange-500/50 focus-visible:border-orange-500 focus-visible:ring-orange-500/30 dark:border-amber-400/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/30"
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
                  >
                    Download
                  </Button>
                </div>
              </div>
              <MarkdownRenderer content={currentDoc.content} />
            </div>
          ) : (
            <EmptyState onLoadSample={handleAddDocument} />
          )}
          </div>

          {currentDoc && (
            <div className="hidden min-h-0 w-48 shrink-0 overflow-y-auto overflow-x-hidden border-l border-border px-6 py-8 lg:block print:hidden">
              <TableOfContents
                key={`${currentDoc.id}-${hashContent(currentDoc.content)}`}
                content={currentDoc.content}
              />
            </div>
          )}
        </div>
      </SidebarInset>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col shadow-xl ring-1 ring-border/50">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit document</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 py-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Markdown content..."
              className="field-sizing-fixed min-h-[50vh] max-h-[60vh] w-full resize-y overflow-y-auto font-mono text-sm"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
