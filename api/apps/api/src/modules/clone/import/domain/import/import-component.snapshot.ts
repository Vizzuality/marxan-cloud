import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
} from '@marxan/cloning/domain';

export interface ImportComponentSnapshot {
  readonly id: ComponentId;
  readonly piece: ClonePiece;
  readonly resourceId: ResourceId;
  readonly order: number;
  readonly uris: ComponentLocation[];
  readonly finished: boolean;
}
