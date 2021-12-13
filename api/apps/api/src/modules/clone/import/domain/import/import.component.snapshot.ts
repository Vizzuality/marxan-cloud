import { ComponentId, ClonePiece, ResourceId } from '@marxan/cloning/domain';

export interface ImportComponentSnapshot {
  readonly id: ComponentId;
  readonly piece: ClonePiece;
  readonly resourceId: ResourceId;
  readonly order: number;
  uri?: string;
}
