import {
  ComponentId,
  ClonePiece,
  ResourceId,
  ComponentLocation,
} from '@marxan/cloning/domain';

export interface ImportComponentSnapshot {
  readonly id: ComponentId;
  readonly piece: ClonePiece;
  readonly resourceId: ResourceId;
  readonly order: number;
  readonly uri: ComponentLocation[];
}
