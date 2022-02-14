import { ClonePiece, ResourceKind } from './domain';

export interface ExportJobInput {
  readonly exportId: string;
  readonly componentId: string;
  readonly resourceId: string;
  readonly resourceKind: ResourceKind;
  readonly piece: ClonePiece;
  readonly allPieces: ClonePiece[];
}
