import type { Document } from "@/types/document";
import {
  getSqliteDb,
  sqlQuery,
  saveSqliteDb,
} from "./sqlite-db";
import { getDb, DOCUMENTS_STORE } from "./db";

const LEGACY_STORAGE_KEY = "md-viewer-documents";

async function migrateFromLocalStorage(db: Awaited<ReturnType<typeof getSqliteDb>>): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;

    const documents: Document[] = JSON.parse(raw);
    if (!Array.isArray(documents) || documents.length === 0) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }

    for (const doc of documents) {
      if (doc.id && doc.title !== undefined) {
        db.run(
          "INSERT OR REPLACE INTO documents (id, title, content, createdAt) VALUES (?, ?, ?, ?)",
          [doc.id, doc.title, doc.content, doc.createdAt]
        );
      }
    }
    await saveSqliteDb(db);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Migration failed
  }
}

async function migrateFromIndexedDB(db: Awaited<ReturnType<typeof getSqliteDb>>): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const oldDb = await getDb();
    const docs = await oldDb.getAll(DOCUMENTS_STORE);
    if (!docs || docs.length === 0) return;

    for (const doc of docs as Document[]) {
      if (doc.id && doc.title !== undefined) {
        db.run(
          "INSERT OR REPLACE INTO documents (id, title, content, createdAt) VALUES (?, ?, ?, ?)",
          [doc.id, doc.title, doc.content, doc.createdAt]
        );
      }
    }
    await saveSqliteDb(db);
    // Clear old store to avoid re-migration
    const tx = oldDb.transaction(DOCUMENTS_STORE, "readwrite");
    await tx.objectStore(DOCUMENTS_STORE).clear();
    await tx.done;
  } catch {
    // Migration failed or old db doesn't exist
  }
}

function getFirstHeading(content: string): string | null {
  const match = content.match(/^#{1,6}\s+(.+)$/m);
  return match ? match[1].replace(/#+\s*$/, "").trim() : null;
}

export async function getDocuments(): Promise<Document[]> {
  if (typeof window === "undefined") return [];
  try {
    const db = await getSqliteDb();
    await migrateFromLocalStorage(db);
    const rows = await sqlQuery<Document>(
      db,
      "SELECT id, title, content, createdAt FROM documents ORDER BY createdAt DESC"
    );
    if (rows.length === 0) {
      await migrateFromIndexedDB(db);
      const migrated = await sqlQuery<Document>(
        db,
        "SELECT id, title, content, createdAt FROM documents ORDER BY createdAt DESC"
      );
      return migrated;
    }
    return rows;
  } catch {
    return [];
  }
}

export async function saveDocuments(documents: Document[]): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getSqliteDb();
    db.run("DELETE FROM documents");
    for (const doc of documents) {
      db.run(
        "INSERT INTO documents (id, title, content, createdAt) VALUES (?, ?, ?, ?)",
        [doc.id, doc.title, doc.content, doc.createdAt]
      );
    }
    await saveSqliteDb(db);
  } catch {
    // Storage full or disabled
  }
}

export async function addDocument(
  doc: Omit<Document, "id" | "createdAt">
): Promise<Document> {
  const documents = await getDocuments();
  const newHeading = getFirstHeading(doc.content);
  const titleLower = doc.title.toLowerCase();

  const existingIndex = documents.findIndex((d) => {
    const headingMatch =
      newHeading &&
      getFirstHeading(d.content)?.toLowerCase() === newHeading.toLowerCase();
    const titleMatch = d.title.toLowerCase() === titleLower;
    return headingMatch || titleMatch;
  });

  if (existingIndex >= 0) {
    const existing = documents[existingIndex];
    const updated: Document = {
      ...existing,
      title: doc.title,
      content: doc.content,
    };
    documents[existingIndex] = updated;
    await saveDocuments(documents);
    return updated;
  }

  const newDoc: Document = {
    ...doc,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const db = await getSqliteDb();
  db.run(
    "INSERT INTO documents (id, title, content, createdAt) VALUES (?, ?, ?, ?)",
    [newDoc.id, newDoc.title, newDoc.content, newDoc.createdAt]
  );
  await saveSqliteDb(db);
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
  const db = await getSqliteDb();
  db.run("DELETE FROM documents WHERE id = ?", [id]);
  await saveSqliteDb(db);
}

export async function getDocument(id: string): Promise<Document | null> {
  const db = await getSqliteDb();
  const rows = await sqlQuery<Document>(
    db,
    "SELECT id, title, content, createdAt FROM documents WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
}
