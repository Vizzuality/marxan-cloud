import { ClonePiece, ResourceKind } from './domain';

export interface ExportJobOutput {
  readonly exportId: string;
  readonly componentId: string;
  readonly resourceId: string;
  readonly piece: ClonePiece;
  readonly uris: Array<{ uri: string; relativePath: string }>;
}

export interface ImportJobOutput {
  readonly importId: string;
  readonly componentId: string;
  readonly pieceResourceId: string;
  readonly projectId: string;
  readonly piece: ClonePiece;
}

export interface FailedImportDbCleanupJobOutput {
  readonly importId: string;
  readonly resourceId: string;
  readonly resourceKind: ResourceKind;
}
