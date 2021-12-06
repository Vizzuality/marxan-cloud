import { ComponentId } from '@marxan-api/modules/clone/shared-kernel/component.id';
import { ClonePiece } from '@marxan-api/modules/clone/shared-kernel/clone-piece';

export interface ImportComponentSnapshot {
  readonly id: ComponentId;
  readonly piece: ClonePiece;
  readonly resourceId: string;
  readonly order: number;
  uri?: string;
}
