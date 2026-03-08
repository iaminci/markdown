export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  workspaceId: string;
  folderId: string | null;
}
