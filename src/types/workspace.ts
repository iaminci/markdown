export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
}

export interface Folder {
  id: string;
  workspaceId: string;
  parentFolderId: string | null;
  name: string;
  createdAt: number;
}
