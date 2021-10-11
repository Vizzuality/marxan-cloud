import { ClonePiece } from '../../../shared-kernel/clone-piece';

export interface ClonePartSnapshot {
  readonly id: string;
  readonly piece: ClonePiece;
  readonly resourceId: string;
  readonly finished: boolean;
  readonly uri?: string;
}
