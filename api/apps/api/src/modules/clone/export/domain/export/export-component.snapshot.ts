import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
} from '@marxan/cloning/domain';

export interface ExportComponentSnapshot {
  readonly id: ComponentId;
  readonly piece: ClonePiece;
  readonly resourceId: string;
  readonly finished: boolean;
  readonly uris: ComponentLocation[];
}
