import { ClonePiece, ComponentLocationSnapshot, ResourceKind } from './domain';

export interface ExportJobInput {
  readonly exportId: string;
  readonly componentId: string;
  readonly resourceId: string;
  readonly resourceKind: ResourceKind;
  readonly piece: ClonePiece;
  readonly allPieces: ClonePiece[];
}

export interface ImportJobInput {
  readonly importId: string;
  readonly componentId: string;
  readonly importResourceId: string;
  readonly componentResourceId: string;
  readonly resourceKind: ResourceKind;
  readonly piece: ClonePiece;
  readonly uris: ComponentLocationSnapshot[];
}
