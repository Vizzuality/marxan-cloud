import { ClonePiece, ResourceKind } from './domain';

export interface JobInput {
  readonly exportId: string;
  readonly componentId: string;
  readonly resourceId: string;
  readonly resourceKind: ResourceKind;
  readonly piece: ClonePiece;
  readonly allPieces: ClonePiece[];
}
