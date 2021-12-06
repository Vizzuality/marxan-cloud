import { ClonePiece } from './domain';

export interface JobInput {
  readonly exportId: string;
  readonly componentId: string;
  readonly resourceId: string;
  readonly piece: ClonePiece;
}
