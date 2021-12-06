import { ClonePiece } from './domain';

export interface JobOutput {
  readonly exportId: string;
  readonly componentId: string;
  readonly resourceId: string;
  readonly piece: ClonePiece;
  readonly uri: string;
}
