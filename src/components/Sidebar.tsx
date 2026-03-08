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
} from "@/lib/storage";
import { CreateNameDialog } from "./CreateNameDialog";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { Plus } from "lucide-react";

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

  const WORKSPACE_KEY = "md-viewer-current-workspace";

  const displayedWorkspaces = selectedWorkspaceId
    ? workspaces.filter((w) => w.id === selectedWorkspaceId)
    : workspaces;

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

  const handleDeleteWorkspace = async (id: string) => {
    if (window.confirm("Delete this workspace and all its contents?")) {
      await deleteWorkspace(id);
      await refreshTreeData();
      onRefresh();
    }
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

  return (
    <ShadcnSidebar collapsible="none" className="print:hidden border-l-4 border-l-orange-500/50 dark:border-l-amber-400/30">
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/*"
        onChange={handleFileChange}
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
            <SidebarGroupLabel className="sr-only">Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaste(!showPaste)}
                  className="flex-1 rounded-lg"
                >
                  Paste
                </Button>
              </div>
              {showPaste && (
                <PasteInput
                  onClose={() => setShowPaste(false)}
                  onSubmit={(title, content) =>
                    onAddDocument(title, content, selectedWorkspaceId ?? undefined, null)
                  }
                />
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="sr-only">Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex items-center gap-1">
                <div className="flex-1 min-w-0">
                  <WorkspaceSwitcher
                    workspaces={workspaces}
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
              onSelectDocument={onSelectDocument}
              onDeleteDocument={onDeleteDocument}
              onAddWorkspace={handleAddWorkspace}
              onAddFolder={handleAddFolder}
              onAddFile={handleAddFile}
              onUploadFile={handleUploadFile}
              onMoveDocument={handleMoveDocument}
              onRenameWorkspace={handleRenameWorkspace}
              onDeleteWorkspace={handleDeleteWorkspace}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onRenameDocument={handleRenameDocument}
            />
            </SidebarGroupContent>
          </SidebarGroup>
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
