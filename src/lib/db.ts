import { openDB } from "idb";

const DB_NAME = "md-viewer-db";
const DB_VERSION = 1;
export const DOCUMENTS_STORE = "documents";

let dbPromise: ReturnType<typeof openDB> | null = null;

export function getDb() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(DOCUMENTS_STORE)) {
          db.createObjectStore(DOCUMENTS_STORE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}
