import type { Document } from "@/types/document";
import { getDb, DOCUMENTS_STORE } from "./db";
const LEGACY_STORAGE_KEY = "md-viewer-documents";

async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;

    const documents: Document[] = JSON.parse(raw);
    if (!Array.isArray(documents) || documents.length === 0) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }

    const database = await getDb();
    const tx = database.transaction(DOCUMENTS_STORE, "readwrite");
    const store = tx.objectStore(DOCUMENTS_STORE);

    for (const doc of documents) {
      if (doc.id && doc.title !== undefined) {
        await store.put(doc);
      }
    }
    await tx.done;
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Migration failed, leave localStorage as-is
  }
}

export async function getDocuments(): Promise<Document[]> {
  if (typeof window === "undefined") return [];
  try {
    await migrateFromLocalStorage();
    const database = await getDb();
    const docs = await database.getAll(DOCUMENTS_STORE);
    return (docs as Document[]).sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function saveDocuments(documents: Document[]): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const database = await getDb();
    const tx = database.transaction(DOCUMENTS_STORE, "readwrite");
    const store = tx.objectStore(DOCUMENTS_STORE);
    await store.clear();
    for (const doc of documents) {
      await store.put(doc);
    }
    await tx.done;
  } catch {
    // Storage full or disabled
  }
}

export async function addDocument(
  doc: Omit<Document, "id" | "createdAt">
): Promise<Document> {
  const newDoc: Document = {
    ...doc,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const documents = await getDocuments();
  documents.unshift(newDoc);
  await saveDocuments(documents);
  return newDoc;
}

export async function updateDocument(
  id: string,
  updates: Partial<Pick<Document, "title" | "content">>
): Promise<Document | null> {
  const documents = await getDocuments();
  const index = documents.findIndex((d) => d.id === id);
  if (index === -1) return null;
  documents[index] = { ...documents[index], ...updates };
  await saveDocuments(documents);
  return documents[index];
}

export async function deleteDocument(id: string): Promise<void> {
  const documents = (await getDocuments()).filter((d) => d.id !== id);
  await saveDocuments(documents);
}

export async function getDocument(id: string): Promise<Document | null> {
  const documents = await getDocuments();
  return documents.find((d) => d.id === id) ?? null;
}
