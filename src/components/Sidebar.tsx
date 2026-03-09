"use client";

import { useRef, useState, useEffect } from "react";
import type { Document } from "@/types/document";
import { WorkspaceTree } from "./WorkspaceTree";
import { Search } from "./Search";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  getWorkspaces,
  getAllFolders,
  getDocuments,
  addWorkspace,
  addFolder,
  addDocument,
  moveDocument,
  updateWorkspace,
  updateFolder,
  updateDocument,
  deleteWorkspace,
  deleteFolder,
  deleteAllData,
  exportWorkspaceData,
  exportAllWorkspacesData,
  exportWorkspacesData,
  importWorkspaceData,
  importAllWorkspacesData,
  type WorkspaceExport,
  type AllWorkspacesExport,
} from "@/lib/storage";
import { CreateNameDialog } from "./CreateNameDialog";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, Download, Trash2 } from "lucide-react";

interface SidebarProps {
  documents: Document[];
  currentId: string | null;
  onSelectDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  onAddDocument: (title: string, content: string, workspaceId?: string, folderId?: string | null) => void;
  onRefresh: () => void;
}

export function Sidebar({
  documents,
  currentId,
  onSelectDocument,
  onDeleteDocument,
  onAddDocument,
  onRefresh,
}: SidebarProps) {
  const [showPaste, setShowPaste] = useState(false);
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogTarget, setFolderDialogTarget] = useState<{
    workspaceId: string;
    parentFolderId: string | null;
  } | null>(null);
  const [renameWorkspaceOpen, setRenameWorkspaceOpen] = useState(false);
  const [renameWorkspaceTarget, setRenameWorkspaceTarget] = useState<{ id: string; name: string } | null>(null);
  const [renameFolderOpen, setRenameFolderOpen] = useState(false);
  const [renameFolderTarget, setRenameFolderTarget] = useState<{ id: string; name: string } | null>(null);
  const [renameDocOpen, setRenameDocOpen] = useState(false);
  const [renameDocTarget, setRenameDocTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteWorkspaceDialogOpen, setDeleteWorkspaceDialogOpen] = useState(false);
  const [deleteWorkspaceTarget, setDeleteWorkspaceTarget] = useState<{ id: string; name: string } | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportConfirmDialogOpen, setExportConfirmDialogOpen] = useState(false);
  const [exportSelectedIds, setExportSelectedIds] = useState<Set<string>>(new Set());
  const [workspaces, setWorkspaces] = useState<Awaited<ReturnType<typeof getWorkspaces>>>([]);
  const [foldersByWorkspace, setFoldersByWorkspace] = useState<
    Map<string, Awaited<ReturnType<typeof getAllFolders>>>
  >(new Map());
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{
    workspaceId: string;
    folderId: string | null;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const WORKSPACE_KEY = "md-viewer-current-workspace";

  const sortedWorkspaces = [...workspaces].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  const displayedWorkspaces = selectedWorkspaceId
    ? sortedWorkspaces.filter((w) => w.id === selectedWorkspaceId)
    : sortedWorkspaces;

  const searchDocuments = selectedWorkspaceId
    ? documents.filter((d) => d.workspaceId === selectedWorkspaceId)
    : documents;

  const refreshTreeData = async () => {
    const [ws, docs] = await Promise.all([getWorkspaces(), getDocuments()]);
    setWorkspaces(ws);
    setAllDocuments(docs);
    const folderMap = new Map<string, Awaited<ReturnType<typeof getAllFolders>>>();
    await Promise.all(
      ws.map(async (w) => {
        const folders = await getAllFolders(w.id);
        folderMap.set(w.id, folders);
      })
    );
    setFoldersByWorkspace(folderMap);
    if (typeof window !== "undefined") {
      setSelectedWorkspaceId((prev) => {
        if (prev !== null && prev !== undefined) return prev;
        const stored = localStorage.getItem(WORKSPACE_KEY);
        if (stored === "") return null;
        if (stored && ws.some((w) => w.id === stored)) return stored;
        return null;
      });
    }
  };

  const getFoldersSync = (workspaceId: string, parentFolderId: string | null) => {
    const folders = foldersByWorkspace.get(workspaceId) ?? [];
    return folders.filter(
      (f) =>
        (parentFolderId === null && f.parentFolderId === null) ||
        (parentFolderId !== null && f.parentFolderId === parentFolderId)
    );
  };

  const getDocumentsSync = (workspaceId: string, folderId: string | null) => {
    return allDocuments.filter(
      (d) =>
        d.workspaceId === workspaceId &&
        (folderId === null ? d.folderId === null : d.folderId === folderId)
    );
  };

  useEffect(() => {
    refreshTreeData();
  }, [documents]);

  const handleUploadFile = (workspaceId: string, folderId: string | null) => {
    setUploadTarget({ workspaceId, folderId });
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const target = uploadTarget ?? {
      workspaceId: selectedWorkspaceId ?? "default",
      folderId: null,
    };
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      const title = file.name.replace(/\.(md|markdown)$/i, "") || "Untitled";
      onAddDocument(title, content, target.workspaceId, target.folderId);
      setUploadTarget(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleWorkspaceSelect = (id: string | null) => {
    setSelectedWorkspaceId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(WORKSPACE_KEY, id ?? "");
    }
  };

  const handleAddWorkspace = () => setWorkspaceDialogOpen(true);

  const handleWorkspaceSubmit = async (name: string) => {
    await addWorkspace(name);
    await refreshTreeData();
    onRefresh();
  };

  const handleAddFolder = (workspaceId: string, parentFolderId: string | null) => {
    setFolderDialogTarget({ workspaceId, parentFolderId });
    setFolderDialogOpen(true);
  };

  const handleFolderSubmit = async (name: string) => {
    if (!folderDialogTarget) return;
    await addFolder(folderDialogTarget.workspaceId, name, folderDialogTarget.parentFolderId);
    setFolderDialogTarget(null);
    await refreshTreeData();
    onRefresh();
  };

  const handleMoveDocument = async (
    docId: string,
    workspaceId: string,
    folderId: string | null
  ) => {
    await moveDocument(docId, workspaceId, folderId);
    await refreshTreeData();
    onRefresh();
  };

  const handleAddFile = async (workspaceId: string, folderId: string | null) => {
    const doc = await addDocument(
      { title: "Untitled", content: "", workspaceId, folderId },
      { workspaceId, folderId }
    );
    await refreshTreeData();
    onRefresh();
    onSelectDocument(doc);
  };

  const handleRenameWorkspace = (id: string, name: string) => {
    setRenameWorkspaceTarget({ id, name });
    setRenameWorkspaceOpen(true);
  };

  const handleRenameWorkspaceSubmit = async (name: string) => {
    if (!renameWorkspaceTarget) return;
    await updateWorkspace(renameWorkspaceTarget.id, name);
    setRenameWorkspaceTarget(null);
    await refreshTreeData();
    onRefresh();
  };

  const handleDeleteWorkspaceRequest = (id: string, name: string) => {
    setDeleteWorkspaceTarget({ id, name });
    setDeleteWorkspaceDialogOpen(true);
  };

  const handleDeleteWorkspaceConfirm = async () => {
    if (!deleteWorkspaceTarget) return;
    await deleteWorkspace(deleteWorkspaceTarget.id);
    setDeleteWorkspaceTarget(null);
    setDeleteWorkspaceDialogOpen(false);
    await refreshTreeData();
    onRefresh();
  };

  const handleDeleteAllClick = () => setDeleteAllDialogOpen(true);

  const handleDeleteAllConfirm = async () => {
    if (selectedWorkspaceId) {
      await deleteWorkspace(selectedWorkspaceId);
      setSelectedWorkspaceId(null);
      if (typeof window !== "undefined") {
        localStorage.setItem(WORKSPACE_KEY, "");
      }
    } else {
      await deleteAllData();
      setSelectedWorkspaceId(null);
      if (typeof window !== "undefined") {
        localStorage.setItem(WORKSPACE_KEY, "");
      }
    }
    setDeleteAllDialogOpen(false);
    await refreshTreeData();
    onRefresh();
  };

  const handleExportClick = () => {
    if (selectedWorkspaceId) {
      setExportConfirmDialogOpen(true);
    } else {
      setExportSelectedIds(new Set(sortedWorkspaces.map((w) => w.id)));
      setExportDialogOpen(true);
    }
  };

  const handleExportConfirm = async () => {
    if (selectedWorkspaceId) {
      await handleExportWorkspace(selectedWorkspaceId);
      setExportConfirmDialogOpen(false);
    }
  };

  const handleExportWorkspace = async (workspaceId: string) => {
    const data = await exportWorkspaceData(workspaceId);
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const filename = `${data.workspace.name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}-export.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSelected = async () => {
    const ids = Array.from(exportSelectedIds);
    if (ids.length === 0) return;
    const data =
      ids.length === sortedWorkspaces.length
        ? await exportAllWorkspacesData()
        : await exportWorkspacesData(ids);
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const filename =
      ids.length === sortedWorkspaces.length
        ? "all-workspaces-export.json"
        : "workspaces-export.json";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
  };

  const toggleExportWorkspace = (id: string) => {
    setExportSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExportSelectAll = () => {
    if (exportSelectedIds.size === sortedWorkspaces.length) {
      setExportSelectedIds(new Set());
    } else {
      setExportSelectedIds(new Set(sortedWorkspaces.map((w) => w.id)));
    }
  };

  const handleImportWorkspace = () => {
    importInputRef.current?.click();
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      if (!data || typeof data !== "object" || !("version" in data)) {
        throw new Error("Invalid workspace export file");
      }
      if ("type" in data && data.type === "all" && "workspaces" in data && Array.isArray(data.workspaces)) {
        const imported = await importAllWorkspacesData(data as AllWorkspacesExport);
        if (imported.length > 0) {
          setSelectedWorkspaceId(imported[0].id);
          if (typeof window !== "undefined") {
            localStorage.setItem(WORKSPACE_KEY, imported[0].id);
          }
        }
      } else if (
        "workspace" in data &&
        "folders" in data &&
        "documents" in data &&
        Array.isArray((data as WorkspaceExport).folders) &&
        Array.isArray((data as WorkspaceExport).documents)
      ) {
        const result = await importWorkspaceData(data as WorkspaceExport);
        if (result) {
          setSelectedWorkspaceId(result.workspace.id);
          if (typeof window !== "undefined") {
            localStorage.setItem(WORKSPACE_KEY, result.workspace.id);
          }
        }
      } else {
        throw new Error("Invalid workspace export file");
      }
      await refreshTreeData();
      onRefresh();
    } catch {
      window.alert("Failed to import workspace. The file may be invalid or corrupted.");
    }
    e.target.value = "";
  };

  const handleRenameFolder = (id: string, name: string) => {
    setRenameFolderTarget({ id, name });
    setRenameFolderOpen(true);
  };

  const handleRenameFolderSubmit = async (name: string) => {
    if (!renameFolderTarget) return;
    await updateFolder(renameFolderTarget.id, name);
    setRenameFolderTarget(null);
    await refreshTreeData();
    onRefresh();
  };

  const handleDeleteFolder = async (id: string) => {
    if (window.confirm("Delete this folder and all its contents?")) {
      await deleteFolder(id);
      await refreshTreeData();
      onRefresh();
    }
  };

  const handleRenameDocument = (id: string, title: string) => {
    setRenameDocTarget({ id, title });
    setRenameDocOpen(true);
  };

  const handleRenameDocumentSubmit = async (title: string) => {
    if (!renameDocTarget) return;
    await updateDocument(renameDocTarget.id, { title });
    setRenameDocTarget(null);
    await refreshTreeData();
    onRefresh();
  };

  const selectedWorkspaceName = selectedWorkspaceId
    ? sortedWorkspaces.find((w) => w.id === selectedWorkspaceId)?.name ?? "workspace"
    : null;

  return (
    <ShadcnSidebar collapsible="none" className="print:hidden border-l-4 border-l-orange-500/50 dark:border-l-amber-400/30">
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFileChange}
        className="hidden"
      />
      <SidebarContent className="flex flex-col min-h-0 overflow-hidden">
        <div className="shrink-0 flex flex-col">
          <SidebarGroup>
            <SidebarGroupLabel className="sr-only">Search</SidebarGroupLabel>
            <SidebarGroupContent>
              <Search documents={searchDocuments} onSelect={onSelectDocument} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="sr-only">Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex items-center gap-1">
                <div className="flex-1 min-w-0">
                  <WorkspaceSwitcher
                    workspaces={sortedWorkspaces}
                    selectedId={selectedWorkspaceId}
                    onSelect={handleWorkspaceSelect}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={handleAddWorkspace}
                  title="New workspace"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <SidebarGroup className="flex-1">
            <SidebarGroupContent>
              <WorkspaceTree
              workspaces={displayedWorkspaces}
              folders={getFoldersSync}
              documents={getDocumentsSync}
              currentId={currentId}
              selectedWorkspaceId={selectedWorkspaceId}
              onSelectDocument={onSelectDocument}
              onDeleteDocument={onDeleteDocument}
              onAddWorkspace={handleAddWorkspace}
              onAddFolder={handleAddFolder}
              onAddFile={handleAddFile}
              onUploadFile={handleUploadFile}
              onMoveDocument={handleMoveDocument}
              onRenameWorkspace={handleRenameWorkspace}
              onDeleteWorkspace={handleDeleteWorkspaceRequest}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onRenameDocument={handleRenameDocument}
            />
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="shrink-0 border-t border-sidebar-border px-2 py-2">
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPaste(!showPaste)}
              className="w-full rounded-lg"
            >
              Paste Markdown
            </Button>
            {showPaste && (
              <PasteInput
                onClose={() => setShowPaste(false)}
                onSubmit={(title, content) =>
                  onAddDocument(title, content, selectedWorkspaceId ?? undefined, null)
                }
              />
            )}
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
              onClick={handleImportWorkspace}
              title="Import workspace"
              >
                <Upload className="mr-1.5 size-4 shrink-0" />
                Import
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleExportClick}
                title={selectedWorkspaceId ? "Export workspace" : "Export all workspaces"}
              >
                <Download className="mr-1.5 size-4 shrink-0" />
                Export
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDeleteAllClick}
              title={
                selectedWorkspaceId
                  ? `Delete workspace and all its contents`
                  : "Delete all workspaces, folders, and documents"
              }
            >
              <Trash2 className="mr-1.5 size-4 shrink-0" />
              {selectedWorkspaceId ? "Delete Workspace" : "Delete Everything"}
            </Button>
          </div>
        </div>
      </SidebarContent>

      <CreateNameDialog
        open={workspaceDialogOpen}
        onOpenChange={setWorkspaceDialogOpen}
        title="New workspace"
        placeholder="Workspace name"
        defaultValue="New Workspace"
        onSubmit={handleWorkspaceSubmit}
      />
      <CreateNameDialog
        open={folderDialogOpen}
        onOpenChange={(open) => {
          setFolderDialogOpen(open);
          if (!open) setFolderDialogTarget(null);
        }}
        title="New folder"
        placeholder="Folder name"
        defaultValue="New Folder"
        onSubmit={handleFolderSubmit}
      />
      <CreateNameDialog
        open={renameWorkspaceOpen}
        onOpenChange={(open) => {
          setRenameWorkspaceOpen(open);
          if (!open) setRenameWorkspaceTarget(null);
        }}
        title="Rename workspace"
        placeholder="Workspace name"
        defaultValue={renameWorkspaceTarget?.name ?? ""}
        submitLabel="Rename"
        onSubmit={handleRenameWorkspaceSubmit}
      />
      <CreateNameDialog
        open={renameFolderOpen}
        onOpenChange={(open) => {
          setRenameFolderOpen(open);
          if (!open) setRenameFolderTarget(null);
        }}
        title="Rename folder"
        placeholder="Folder name"
        defaultValue={renameFolderTarget?.name ?? ""}
        submitLabel="Rename"
        onSubmit={handleRenameFolderSubmit}
      />
      <CreateNameDialog
        open={renameDocOpen}
        onOpenChange={(open) => {
          setRenameDocOpen(open);
          if (!open) setRenameDocTarget(null);
        }}
        title="Rename document"
        placeholder="Document title"
        defaultValue={renameDocTarget?.title ?? ""}
        submitLabel="Rename"
        onSubmit={handleRenameDocumentSubmit}
      />

      <AlertDialog open={exportConfirmDialogOpen} onOpenChange={setExportConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Export &quot;{selectedWorkspaceName}&quot; as a JSON file? This will include the
              workspace, all folders, and documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleExportConfirm()}>
              Export
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedWorkspaceId
                ? `Delete "${selectedWorkspaceName}" and all its contents?`
                : "Delete all workspaces, folders, and documents?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedWorkspaceId ? (
                <>
                  This will permanently delete the workspace "{selectedWorkspaceName}" and everything
                  inside it (folders and documents). This action cannot be undone.
                </>
              ) : (
                <>
                  This will permanently delete all workspaces, folders, and documents. A default empty
                  workspace will be created. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                void handleDeleteAllConfirm();
              }}
            >
              {selectedWorkspaceId ? "Delete Workspace" : "Delete Everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteWorkspaceDialogOpen}
        onOpenChange={(open) => {
          setDeleteWorkspaceDialogOpen(open);
          if (!open) setDeleteWorkspaceTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;{deleteWorkspaceTarget?.name}&quot; and all its contents?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workspace and everything inside it (folders and
              documents). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                void handleDeleteWorkspaceConfirm();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>Export workspaces</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-orange-200/50 dark:hover:bg-amber-800/30">
              <Checkbox
                checked={
                  sortedWorkspaces.length > 0 &&
                  exportSelectedIds.size === sortedWorkspaces.length
                }
                onCheckedChange={toggleExportSelectAll}
              />
              <span className="text-sm font-medium">Select all</span>
            </label>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1 border rounded-lg p-2">
              {sortedWorkspaces.map((ws) => (
                <label
                  key={ws.id}
                  className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-orange-200/50 dark:hover:bg-amber-800/30"
                >
                  <Checkbox
                    checked={exportSelectedIds.has(ws.id)}
                    onCheckedChange={() => toggleExportWorkspace(ws.id)}
                  />
                  <span className="text-sm truncate">{ws.name}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleExportSelected()}
              disabled={exportSelectedIds.size === 0}
            >
              Export {exportSelectedIds.size > 0 ? `(${exportSelectedIds.size})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ShadcnSidebar>
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

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const firstLine = trimmed.split("\n")[0]?.trim() || "";
    const title = firstLine || "Untitled";
    onSubmit(title, trimmed);
    setValue("");
    onClose();
  };

  return (
    <Card className="mt-3 rounded-xl border shadow-sm">
      <CardContent className="pt-4">
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
