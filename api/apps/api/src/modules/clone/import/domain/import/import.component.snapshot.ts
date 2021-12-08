import { ComponentId, ClonePiece } from '@marxan/cloning/domain';

export interface ImportComponentSnapshot {
  readonly id: ComponentId;
  readonly piece: ClonePiece;
  readonly resourceId: string;
  readonly order: number;
  uri?: string;
}
