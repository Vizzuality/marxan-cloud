import { ClonePiece } from '@marxan/cloning/domain';
import { ComponentLocationSnapshot } from '@marxan/cloning/domain/component-location.snapshot';

export interface ExportComponentSnapshot {
  readonly id: string;
  readonly piece: ClonePiece;
  readonly resourceId: string;
  readonly finished: boolean;
  readonly uris: ComponentLocationSnapshot[];
}
