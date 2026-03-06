import type { Document } from "@/types/document";

const STORAGE_KEY = "md-viewer-documents";

export function getDocuments(): Document[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDocuments(documents: Document[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  } catch {
    // Storage full or disabled
  }
}

export function addDocument(doc: Omit<Document, "id" | "createdAt">): Document {
  const documents = getDocuments();
  const newDoc: Document = {
    ...doc,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  documents.unshift(newDoc);
  saveDocuments(documents);
  return newDoc;
}

export function updateDocument(
  id: string,
  updates: Partial<Pick<Document, "title" | "content">>
): Document | null {
  const documents = getDocuments();
  const index = documents.findIndex((d) => d.id === id);
  if (index === -1) return null;
  documents[index] = { ...documents[index], ...updates };
  saveDocuments(documents);
  return documents[index];
}

export function deleteDocument(id: string): void {
  const documents = getDocuments().filter((d) => d.id !== id);
  saveDocuments(documents);
}

export function getDocument(id: string): Document | null {
  return getDocuments().find((d) => d.id === id) ?? null;
}
