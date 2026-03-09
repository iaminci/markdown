"use client";

import { useState } from "react";
import type { Document } from "@/types/document";
import type { Workspace } from "@/types/workspace";
import type { Folder } from "@/types/workspace";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderIcon,
  FileIcon,
  Trash2,
  Plus,
  MoreHorizontal,
  Pencil,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DRAG_TYPE = "application/x-md-viewer-document";

function getFirstHeading(content: string): string | null {
  const match = content.match(/^#{1,6}\s+(.+)$/m);
  return match ? match[1].replace(/#+\s*$/, "").trim() : null;
}

interface WorkspaceTreeProps {
  workspaces: Workspace[];
  folders: (workspaceId: string, parentFolderId: string | null) => Folder[];
  documents: (workspaceId: string, folderId: string | null) => Document[];
  currentId: string | null;
  selectedWorkspaceId: string | null;
  onSelectDocument: (doc: Document) => void;
  onDeleteDocument: (id: string, title: string) => void;
  onAddWorkspace: () => void;
  onAddFolder: (workspaceId: string, parentFolderId: string | null) => void;
  onAddFile: (workspaceId: string, folderId: string | null) => void;
  onUploadFile: (workspaceId: string, folderId: string | null) => void;
  onMoveDocument: (docId: string, workspaceId: string, folderId: string | null) => void;
  onRenameWorkspace: (id: string, name: string) => void;
  onDeleteWorkspace: (id: string, name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string, name: string) => void;
  onRenameDocument: (id: string, title: string) => void;
}

export function WorkspaceTree({
  workspaces,
  folders,
  documents,
  currentId,
  selectedWorkspaceId,
  onSelectDocument,
  onDeleteDocument,
  onAddWorkspace,
  onAddFolder,
  onAddFile,
  onUploadFile,
  onMoveDocument,
  onRenameWorkspace,
  onDeleteWorkspace,
  onRenameFolder,
  onDeleteFolder,
  onRenameDocument,
}: WorkspaceTreeProps) {
  const workspaceIds = workspaces.map((w) => w.id);

  return (
    <div className="flex flex-col gap-0">
      <Accordion
        multiple
        key={workspaceIds.join(",")}
        defaultValue={workspaceIds}
        className="border-none max-w-full"
      >
        {workspaces.map((ws) => (
          <WorkspaceSection
            key={ws.id}
            workspace={ws}
            folders={folders(ws.id, null)}
            documents={documents(ws.id, null)}
            getFolders={folders}
            getDocuments={documents}
            currentId={currentId}
            selectedWorkspaceId={selectedWorkspaceId}
            onSelectDocument={onSelectDocument}
            onDeleteDocument={onDeleteDocument}
            onAddFolder={onAddFolder}
            onAddFile={onAddFile}
            onUploadFile={onUploadFile}
            onMoveDocument={onMoveDocument}
            onRenameWorkspace={onRenameWorkspace}
            onDeleteWorkspace={onDeleteWorkspace}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onRenameDocument={onRenameDocument}
          />
        ))}
      </Accordion>
    </div>
  );
}

interface WorkspaceSectionProps {
  workspace: Workspace;
  folders: Folder[];
  documents: Document[];
  getFolders: (workspaceId: string, parentFolderId: string | null) => Folder[];
  getDocuments: (workspaceId: string, folderId: string | null) => Document[];
  currentId: string | null;
  selectedWorkspaceId: string | null;
  onSelectDocument: (doc: Document) => void;
  onDeleteDocument: (id: string, title: string) => void;
  onAddFolder: (workspaceId: string, parentFolderId: string | null) => void;
  onAddFile: (workspaceId: string, folderId: string | null) => void;
  onUploadFile: (workspaceId: string, folderId: string | null) => void;
  onMoveDocument: (docId: string, workspaceId: string, folderId: string | null) => void;
  onRenameWorkspace: (id: string, name: string) => void;
  onDeleteWorkspace: (id: string, name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string, name: string) => void;
  onRenameDocument: (id: string, title: string) => void;
}

function WorkspaceSection({
  workspace,
  folders,
  documents,
  getFolders,
  getDocuments,
  currentId,
  selectedWorkspaceId,
  onSelectDocument,
  onDeleteDocument,
  onAddFolder,
  onAddFile,
  onUploadFile,
  onMoveDocument,
  onRenameWorkspace,
  onDeleteWorkspace,
  onRenameFolder,
  onDeleteFolder,
  onRenameDocument,
}: WorkspaceSectionProps) {
  const [wsDragOver, setWsDragOver] = useState(false);
  const folderIds = folders.map((f) => f.id);

  const handleWsDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setWsDragOver(true);
  };

  const handleWsDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setWsDragOver(false);
  };

  const handleWsDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWsDragOver(false);
    const docId = e.dataTransfer.getData(DRAG_TYPE);
    if (docId) onMoveDocument(docId, workspace.id, null);
  };

  return (
    <AccordionItem
      value={workspace.id}
      className="border-none rounded-xl px-2 py-0 -mx-2"
    >
        <AccordionTrigger
          className={cn(
            "group/ws flex w-full items-center rounded-xl pl-3 pr-2 py-1 hover:no-underline hover:bg-orange-200/50 dark:hover:bg-amber-800/30 [&>[data-slot=accordion-trigger-icon]]:ml-auto",
            wsDragOver && "bg-primary/15 ring-2 ring-primary/30"
          )}
          onDragOver={handleWsDragOver}
          onDragLeave={handleWsDragLeave}
          onDrop={handleWsDrop}
        >
          <div className="flex flex-1 min-w-0 items-center gap-3">
            <Library className="size-4 shrink-0 text-orange-500/80 dark:text-amber-500/70" />
            <span className="truncate text-left">{workspace.name}</span>
          </div>
          <div className="ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-0 transition-opacity group-hover/ws:opacity-100 hover:bg-sidebar-accent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") e.preventDefault();
                    }}
                  >
                    <MoreHorizontal className="size-3.5" />
                  </div>
                }
              />
              <DropdownMenuContent align="end" className="rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onAddFolder(workspace.id, null)}>
                  <FolderIcon className="mr-2 size-4" />
                  Add folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUploadFile(workspace.id, null)}>
                  <FileIcon className="mr-2 size-4" />
                  Upload file
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRenameWorkspace(workspace.id, workspace.name)}>
                  <Pencil className="mr-2 size-4" />
                  Rename
                </DropdownMenuItem>
                {!selectedWorkspaceId && (
                  <DropdownMenuItem variant="destructive" onClick={() => onDeleteWorkspace(workspace.id, workspace.name)}>
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <WorkspaceDropArea
            workspaceId={workspace.id}
            folderId={null}
            onDrop={onMoveDocument}
            className="flex flex-col gap-0 pt-0.5 pb-1 ml-2 pl-3"
          >
            {folders.length > 0 && (
              <Accordion
                multiple
                key={folderIds.join(",")}
                defaultValue={folderIds}
                className="border-none"
              >
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    workspaceId={workspace.id}
                    getFolders={getFolders}
                    getDocuments={getDocuments}
                    currentId={currentId}
                    onSelectDocument={onSelectDocument}
                    onDeleteDocument={onDeleteDocument}
                    onAddFolder={onAddFolder}
                    onAddFile={onAddFile}
                    onUploadFile={onUploadFile}
                    onMoveDocument={onMoveDocument}
                    onRenameFolder={onRenameFolder}
                    onDeleteFolder={onDeleteFolder}
                    onRenameDocument={onRenameDocument}
                  />
                ))}
              </Accordion>
            )}
            {documents.map((doc) => (
              <FileItem
                key={doc.id}
                doc={doc}
                isActive={currentId === doc.id}
                onSelect={() => onSelectDocument(doc)}
                onDelete={() => onDeleteDocument(doc.id, doc.title)}
                onRename={() => onRenameDocument(doc.id, doc.title)}
                onMoveDocument={onMoveDocument}
              />
            ))}
          </WorkspaceDropArea>
        </AccordionContent>
    </AccordionItem>
  );
}

function WorkspaceDropArea({
  workspaceId,
  folderId,
  onDrop,
  className,
  children,
}: {
  workspaceId: string;
  folderId: string | null;
  onDrop: (docId: string, workspaceId: string, folderId: string | null) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const docId = e.dataTransfer.getData(DRAG_TYPE);
    if (docId) onDrop(docId, workspaceId, folderId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "transition-all duration-150 rounded-lg",
        isDragOver && "bg-primary/15 ring-2 ring-primary/30 ring-inset",
        className
      )}
    >
      {children}
    </div>
  );
}

interface FolderItemProps {
  folder: Folder;
  workspaceId: string;
  getFolders: (workspaceId: string, parentFolderId: string | null) => Folder[];
  getDocuments: (workspaceId: string, folderId: string | null) => Document[];
  currentId: string | null;
  onSelectDocument: (doc: Document) => void;
  onDeleteDocument: (id: string, title: string) => void;
  onAddFolder: (workspaceId: string, parentFolderId: string | null) => void;
  onAddFile: (workspaceId: string, folderId: string | null) => void;
  onUploadFile: (workspaceId: string, folderId: string | null) => void;
  onMoveDocument: (docId: string, workspaceId: string, folderId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string, name: string) => void;
  onRenameDocument: (id: string, title: string) => void;
}

function FolderItem({
  folder,
  workspaceId,
  getFolders,
  getDocuments,
  currentId,
  onSelectDocument,
  onDeleteDocument,
  onAddFolder,
  onAddFile,
  onUploadFile,
  onMoveDocument,
  onRenameFolder,
  onDeleteFolder,
  onRenameDocument,
}: FolderItemProps) {
  const subfolders = getFolders(workspaceId, folder.id);
  const docs = getDocuments(workspaceId, folder.id);
  const subfolderIds = subfolders.map((f) => f.id);

  const [folderDragOver, setFolderDragOver] = useState(false);

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setFolderDragOver(true);
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setFolderDragOver(false);
  };

  const handleFolderDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFolderDragOver(false);
    const docId = e.dataTransfer.getData(DRAG_TYPE);
    if (docId) onMoveDocument(docId, workspaceId, folder.id);
  };

  return (
    <AccordionItem value={folder.id} className="border-none">
      <AccordionTrigger
        className={cn(
          "group/folder flex w-full items-center rounded-xl pl-3 pr-2 py-1 hover:no-underline hover:bg-orange-200/50 dark:hover:bg-amber-800/30 [&>[data-slot=accordion-trigger-icon]]:ml-auto",
          folderDragOver && "bg-primary/15 ring-2 ring-primary/30"
        )}
        onDragOver={handleFolderDragOver}
        onDragLeave={handleFolderDragLeave}
        onDrop={handleFolderDrop}
      >
        <div className="flex flex-1 min-w-0 items-center gap-3">
          <FolderIcon className="size-4 shrink-0 text-orange-500/80 dark:text-amber-500/70" />
          <span className="truncate text-left">{folder.name}</span>
        </div>
        <div className="ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              nativeButton={false}
              render={
                <div
                  role="button"
                  tabIndex={0}
                  className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-0 transition-opacity group-hover/folder:opacity-100 hover:bg-sidebar-accent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") e.preventDefault();
                  }}
                >
                  <MoreHorizontal className="size-3.5" />
                </div>
              }
            />
            <DropdownMenuContent align="end" className="rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onAddFolder(workspaceId, folder.id)}>
                <FolderIcon className="mr-2 size-4" />
                Add folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUploadFile(workspaceId, folder.id)}>
                <FileIcon className="mr-2 size-4" />
                Upload file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRenameFolder(folder.id, folder.name)}>
                <Pencil className="mr-2 size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDeleteFolder(folder.id, folder.name)}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0">
        <WorkspaceDropArea
          workspaceId={workspaceId}
          folderId={folder.id}
          onDrop={onMoveDocument}
          className="ml-2 flex flex-col gap-0 pl-3 pt-0.5"
        >
          {subfolders.length > 0 && (
            <Accordion
              multiple
              key={subfolderIds.join(",")}
              defaultValue={subfolderIds}
              className="border-none"
            >
              {subfolders.map((sub) => (
                <FolderItem
                  key={sub.id}
                  folder={sub}
                  workspaceId={workspaceId}
                  getFolders={getFolders}
                  getDocuments={getDocuments}
                  currentId={currentId}
                  onSelectDocument={onSelectDocument}
                  onDeleteDocument={onDeleteDocument}
                  onAddFolder={onAddFolder}
                  onAddFile={onAddFile}
                  onUploadFile={onUploadFile}
                  onMoveDocument={onMoveDocument}
                  onRenameFolder={onRenameFolder}
                  onDeleteFolder={onDeleteFolder}
                  onRenameDocument={onRenameDocument}
                />
                ))}
              </Accordion>
            )}
          {docs.map((doc) => (
            <FileItem
              key={doc.id}
              doc={doc}
              isActive={currentId === doc.id}
              onSelect={() => onSelectDocument(doc)}
              onDelete={() => onDeleteDocument(doc.id, doc.title)}
              onRename={() => onRenameDocument(doc.id, doc.title)}
              onMoveDocument={onMoveDocument}
            />
          ))}
        </WorkspaceDropArea>
      </AccordionContent>
    </AccordionItem>
  );
}

function FileItem({
  doc,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onMoveDocument,
}: {
  doc: Document;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: () => void;
  onMoveDocument: (docId: string, workspaceId: string, folderId: string | null) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const displayName = getFirstHeading(doc.content) ?? doc.title;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(DRAG_TYPE, doc.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group flex items-center gap-1 rounded-xl pl-0 pr-1.5 py-1 transition-colors cursor-pointer",
        isActive
          ? "bg-orange-200 dark:bg-amber-800/50"
          : "hover:bg-orange-200/50 dark:hover:bg-amber-800/30"
      )}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-slot='dropdown-menu-trigger']")) {
          onSelect();
        }
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "flex-1 min-w-0 justify-start gap-1 truncate font-normal h-6 px-1.5 rounded-lg",
          isActive && "font-bold"
        )}
      >
        <FileIcon className="size-4 shrink-0 text-orange-500/80 dark:text-amber-500/70" />
        <span className="truncate" title={displayName}>
          {displayName}
        </span>
      </Button>
      <div className="ml-auto shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-6 shrink-0 rounded-md transition-opacity",
                  showMenu ? "opacity-100" : "opacity-0"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="rounded-lg shadow-lg">
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="mr-2 size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
