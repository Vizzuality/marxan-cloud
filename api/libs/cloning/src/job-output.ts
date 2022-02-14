import { ClonePiece } from './domain';

export interface ExportJobOutput {
  readonly exportId: string;
  readonly componentId: string;
  readonly resourceId: string;
  readonly piece: ClonePiece;
  readonly uris: Array<{ uri: string; relativePath: string }>;
}
